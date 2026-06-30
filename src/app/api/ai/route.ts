import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_EMBEDDED_KEY_FOR_DASHBOARD";

export async function POST(request: Request) {
  try {
    const { prompt, currentData } = await request.json();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh';
    
    if (!prompt || !currentData) {
      return NextResponse.json({ error: '缺少必要参数 prompt 或 currentData' }, { status: 400 });
    }

    // 1. 服务端自主为当前请求签发一个 60 秒内有效的安全临时 Token
    const internalToken = jwt.sign(
      { sub: "nextjs_gateway", exp: Math.floor(Date.now() / 1000) + 60 },
      JWT_SECRET
    );

    // 在喂给 Python 的 prompt 里动态加上约束
    const langChainPrompt = locale === 'zh' 
    ? "\n你是一个数据分析专家，请使用【中文】输出一份专业的 JSON 格式分析报告..."
    : "\nYou are a data analyst expert. Please output a professional JSON analysis report in 【English】...";


    // 将请求转发至 Python FastAPI 分析层
    const pythonResponse = await fetch('http://localhost:8000/api/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internalToken}`, // 使用内部 Token 进行身份验证
      },
      body: JSON.stringify({
        prompt: `${prompt}${langChainPrompt}`,
        data: currentData,
      }),
    });

    if (!pythonResponse.ok) {
      const errText = await pythonResponse.text();
      return NextResponse.json({ error: `Backend service error: ${errText}` }, { status: pythonResponse.status });
    }

    const aiResult = await pythonResponse.json();
    
    // 将 LangChain 格式化好的数据原样安全返回给前端
    return NextResponse.json(aiResult);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : '未知全栈网关异常';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}