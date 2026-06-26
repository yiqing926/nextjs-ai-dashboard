import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
#from langchain_aws import ChatBedrockConverse
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import jwt

app = FastAPI()

# -------------------------------------------------------------
# 1. 基础配置与安全密钥（生产环境从环境变量读取）
# -------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET","YOUR_SUPER_SECRET_EMBEDDED_KEY_FOR_DASHBOARD")
JWT_ALGORITHM = "HS256"

app = FastAPI(title="Next.js Fullstack Dashboard AI Engine")
security = HTTPBearer()

# 允许跨域（Next.js 网关中转调用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 2. 鉴权依赖项：拦截未授权的非法请求
# -------------------------------------------------------------
async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """验证请求头中的 Bearer Token"""
    token = credentials.credentials
    try:
        # 解密并验证 Token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload  # 返回解密后的用户信息（如 {"sub": "user_123"}）
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已过期，请重新登录")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的身份凭证，拒绝访问")

# -------------------------------------------------------------
# 3. Pydantic 数据模型与 LCEL 链条
# -------------------------------------------------------------

# 3.1. 定义输入的指标数据结构（对接你的 DailyMetrics）
class DailyMetricSchema(BaseModel):
    # 显式使用 model_config（Pydantic V2 规范）
    # 它会自动处理前端传来的驼峰键名（activeUsers），并映射给 Python 的下划线变量（active_users）
    model_config = ConfigDict(
        populate_by_name=True
    )

    date: str
    revenue: float
    # 通过 Field(validation_alias=...) 强制兼容前端小驼峰入参
    active_users: int = Field(validation_alias="activeUsers")
    conversion_rate: float = Field(validation_alias="conversionRate")


class AnalysisRequest(BaseModel):
    prompt: str                          # 用户的提问
    data: List[DailyMetricSchema]        # 前端传过来的当前看板数据

# 3.2. 定义大模型必须遵循的强类型结构化输出
class AIAnalysisResponse(BaseModel):
    summary_verdict: str = Field(description="高度概括的一句话分析结论")
    deep_dive: List[str] = Field(description="多维度的深度根因分析要点列表")
    action_plan: List[str] = Field(description="具体可执行的业务或技术改进建议列表")
    highlight_date: Optional[str] = Field(description="数据中值得警惕或关注的特定日期，如果没有则为 None")

# 3.3. 初始化大语言模型（这里以 OpenAI 为例，你也可以换成 AWS Bedrock Claude）
# 确保你配置了环境变量：export OPENAI_API_KEY="your-key"
# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
# 用deepseek替代
llm = ChatOpenAI(
    model="deepseek-chat", # 或者其他兼容大模型
    temperature=0.2,
    openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
    openai_api_base="https://api.deepseek.com/v1" # 或者是硅基流动的 URL
)

# For DeekSeek
parser = JsonOutputParser(pydantic_object=AIAnalysisResponse)

# 初始化大语言模型（这里以 AWS Bedrock Claude 为例，你也可以换成 OpenAI）
# 确保你配置了环境变量：export AWS_ACCESS_KEY_ID="your-key"
# llm = ChatBedrockConverse(
#     # 填入 Amazon Nova Lite 对应的最新模型 ID
#     model="amazon.nova-lite-v1:0", 
#     temperature=0.2,
#     region_name="us-east-1"  # 推荐弗吉尼亚北部，模型最全价格最低
# )


# 3.4. 构建 Prompt 策略
system_prompt = (
    "你是一名顶尖的数据科学家与商业分析大模型。你的任务是结合用户提出的问题，"
    "对提供的电商/运营核心指标日活、收入和转化率序列数据(DailyMetrics)进行深度关联分析,并找出趋势,异常和建议。\n\n"
    # DeepSeek请确保输出格式必须返回 JSON 格式的数据
    "【重要】你必须严格按照下述 JSON 格式返回数据，不要包含任何 Markdown 块或包裹符号，确保键名完全一致：\n\n"
    "{format_instructions}"
)

prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("user", "用户问题: {user_prompt}\n\n当前看板数据集:\n{dataset}")
])

# For DeepSeek
#structured_llm = llm.with_structured_output(AIAnalysisResponse)
# 串联 LangChain 链
#chain = prompt_template | structured_llm
chain = prompt_template | llm.bind(response_format={"type": "json_object"}) | parser

# -------------------------------------------------------------
# 4. 路由层：挂载 verify_jwt_token 守卫
# -------------------------------------------------------------

# For DeepSeek  
# @app.post("/api/v1/analyze", response_model=AIAnalysisResponse)
@app.post("/api/v1/analyze")
async def analyze_metrics( request: AnalysisRequest, 
                          user_info: dict = Depends(verify_jwt_token)):
    
    # 只有 Next.js 服务端生成了正确 Token 的合法请求，才会被分发到这里
    # 将前端传来的 DailyMetrics 结构转化为紧凑的文本传给 Prompt
    try:
        dataset_str = "\n".join([
            f"日期:{m.date} | 收入:${m.revenue} | 日活:{m.active_users} | 转化率:{m.conversion_rate}%"
            for m in request.data
        ])
        
        # 执行分析
        result = chain.invoke({
            "user_prompt": request.prompt,
            "dataset": dataset_str,
            # For DeepSeek
            "format_instructions": parser.get_format_instructions()
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)