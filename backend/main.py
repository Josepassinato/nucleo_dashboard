"""
Núcleo Ventures - Backend API
Gerencia agentes, ações e integração com CrewAI + Gemini
"""

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai
from enum import Enum

load_dotenv()

# Configurar Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Núcleo Ventures API", version="1.0.0")

# CORS - Permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MODELS
# ============================================================================

class AgentStatus(str, Enum):
    ACTIVE = "active"
    IDLE = "idle"
    WARNING = "warning"
    ERROR = "error"

class Agent(BaseModel):
    id: str
    name: str
    role: str
    score: float
    stress: int
    status: AgentStatus
    last_action: str
    last_update: str

class Action(BaseModel):
    id: str
    agent_id: str
    agent_name: str
    role: str
    timestamp: str
    action: str
    description: str
    color: str
    result: Optional[str] = None

class VisionRequest(BaseModel):
    text: str

class VisionResponse(BaseModel):
    status: str
    message: str
    affected_agents: List[str]
    actions: List[str]

# ============================================================================
# DATABASE SIMULADO (Em produção, usar PostgreSQL/MongoDB)
# ============================================================================

agents_db = {
    "lucas": Agent(
        id="lucas",
        name="Lucas Mendes",
        role="CEO",
        score=9.4,
        stress=32,
        status=AgentStatus.ACTIVE,
        last_action="Orquestrou nova estratégia de crescimento",
        last_update=datetime.now().isoformat(),
    ),
    "mariana": Agent(
        id="mariana",
        name="Mariana Oliveira",
        role="CMO",
        score=8.9,
        stress=58,
        status=AgentStatus.ACTIVE,
        last_action="Criou 3 Reels – engajamento +22%",
        last_update=datetime.now().isoformat(),
    ),
    "pedro": Agent(
        id="pedro",
        name="Pedro Lima",
        role="CFO",
        score=9.1,
        stress=25,
        status=AgentStatus.ACTIVE,
        last_action="Otimizou fluxo de caixa",
        last_update=datetime.now().isoformat(),
    ),
    "carla": Agent(
        id="carla",
        name="Carla Santos",
        role="COO",
        score=8.7,
        stress=42,
        status=AgentStatus.ACTIVE,
        last_action="Resolveu 5 tickets de atendimento",
        last_update=datetime.now().isoformat(),
    ),
    "rafael": Agent(
        id="rafael",
        name="Rafael Torres",
        role="CPO",
        score=8.3,
        stress=65,
        status=AgentStatus.WARNING,
        last_action="Testou novo feature A/B",
        last_update=datetime.now().isoformat(),
    ),
    "ana": Agent(
        id="ana",
        name="Ana Costa",
        role="CHRO",
        score=9.0,
        stress=35,
        status=AgentStatus.ACTIVE,
        last_action="Onboarding de novo agente",
        last_update=datetime.now().isoformat(),
    ),
    "ze": Agent(
        id="ze",
        name="Zé Carvalho",
        role="Coach",
        score=9.2,
        stress=20,
        status=AgentStatus.ACTIVE,
        last_action="Sessão de coaching com Rafael",
        last_update=datetime.now().isoformat(),
    ),
    "dani": Agent(
        id="dani",
        name="Dani Ferreira",
        role="Analista",
        score=8.8,
        stress=48,
        status=AgentStatus.ACTIVE,
        last_action="Identificou 3 oportunidades de mercado",
        last_update=datetime.now().isoformat(),
    ),
}

actions_db: List[Action] = [
    Action(
        id="1",
        agent_id="mariana",
        agent_name="Mariana Oliveira",
        role="CMO",
        timestamp="14:22",
        action="Novo Reel lançado",
        description="projetado +18% engajamento",
        color="from-pink-500 to-rose-600",
        result="✅ Engajamento +18%",
    ),
    Action(
        id="2",
        agent_id="pedro",
        agent_name="Pedro Lima",
        role="CFO",
        timestamp="14:15",
        action="Fluxo de caixa otimizado",
        description="economia de R$ 2.340",
        color="from-blue-500 to-cyan-600",
        result="✅ Economia R$ 2.340",
    ),
    Action(
        id="3",
        agent_id="carla",
        agent_name="Carla Santos",
        role="COO",
        timestamp="14:08",
        action="5 tickets resolvidos",
        description="tempo médio 12 minutos",
        color="from-emerald-500 to-teal-600",
        result="✅ 5 tickets resolvidos",
    ),
]

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check"""
    return {"status": "online", "service": "Núcleo Ventures API"}

@app.get("/api/agents", response_model=List[Agent])
async def get_agents():
    """Retorna lista de todos os agentes"""
    return list(agents_db.values())

@app.get("/api/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """Retorna dados de um agente específico"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agente não encontrado")
    return agents_db[agent_id]

@app.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, agent: Agent):
    """Atualiza dados de um agente"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agente não encontrado")
    
    agent.last_update = datetime.now().isoformat()
    agents_db[agent_id] = agent
    return {"status": "success", "agent": agent}

@app.get("/api/actions", response_model=List[Action])
async def get_actions():
    """Retorna últimas ações dos agentes"""
    return sorted(actions_db, key=lambda x: x.timestamp, reverse=True)[:5]

@app.post("/api/vision", response_model=VisionResponse)
async def disseminar_visao(request: VisionRequest):
    """
    Processa uma nova visão estratégica usando Gemini
    Decompõe a visão em ações para cada agente
    """
    
    try:
        # Usar Gemini para analisar a visão
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Você é um analisador estratégico de uma diretoria de IA autônoma.
        
        Visão fornecida: {request.text}
        
        Analise esta visão e retorne um JSON com:
        1. affected_agents: lista de IDs de agentes afetados (lucas, mariana, pedro, carla, rafael, ana, ze, dani)
        2. actions: lista de 3-5 ações específicas que cada agente deve tomar
        3. summary: resumo da decomposição
        
        Retorne APENAS o JSON, sem markdown ou explicações adicionais.
        
        Exemplo de formato:
        {{
            "affected_agents": ["mariana", "pedro"],
            "actions": [
                "Mariana: Reduzir orçamento de anúncios em 20%",
                "Pedro: Revisar fluxo de caixa mensal"
            ],
            "summary": "Foco em otimização de custos"
        }}
        """
        
        response = model.generate_content(prompt)
        result = json.loads(response.text)
        
        # Criar ação no histórico
        new_action = Action(
            id=str(len(actions_db) + 1),
            agent_id="lucas",
            agent_name="Lucas Mendes",
            role="CEO",
            timestamp=datetime.now().strftime("%H:%M"),
            action="Nova visão disseminada",
            description=request.text[:50] + "...",
            color="from-yellow-500 to-orange-600",
            result="✅ Visão processada e distribuída",
        )
        actions_db.append(new_action)
        
        # Atualizar estresse dos agentes afetados
        for agent_id in result.get("affected_agents", []):
            if agent_id in agents_db:
                agent = agents_db[agent_id]
                agent.stress = min(100, agent.stress + 15)  # Aumentar estresse
                agent.last_update = datetime.now().isoformat()
        
        return VisionResponse(
            status="success",
            message="Visão disseminada com sucesso",
            affected_agents=result.get("affected_agents", []),
            actions=result.get("actions", []),
        )
    
    except Exception as e:
        return VisionResponse(
            status="error",
            message=f"Erro ao processar visão: {str(e)}",
            affected_agents=[],
            actions=[],
        )

@app.get("/api/metrics")
async def get_metrics():
    """Retorna métricas gerais do negócio"""
    return {
        "revenue_today": 18472,
        "revenue_growth": 12.4,
        "total_sales": 212,
        "average_ticket": 87.30,
        "cash_today": 47820,
        "cash_inflow": 21450,
        "cash_outflow": 3978,
        "roas": 4.8,
        "churn": 3.9,
        "gross_margin": 87,
        "active_campaigns": 7,
        "daily_spend": 1820,
    }

@app.get("/api/health")
async def health_check():
    """Verifica saúde do sistema"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents_online": len([a for a in agents_db.values() if a.status != AgentStatus.ERROR]),
        "total_agents": len(agents_db),
        "recent_actions": len(actions_db),
    }

# ============================================================================
# WEBSOCKET (Para atualizações em tempo real)
# ============================================================================

connected_clients: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket para atualizações em tempo real"""
    await websocket.accept()
    connected_clients.append(websocket)
    
    try:
        while True:
            # Receber mensagens do cliente
            data = await websocket.receive_text()
            
            # Processar comando
            if data == "ping":
                await websocket.send_text("pong")
            elif data.startswith("update:"):
                # Notificar todos os clientes sobre atualização
                for client in connected_clients:
                    try:
                        await client.send_text(data)
                    except:
                        pass
    
    except Exception as e:
        print(f"WebSocket erro: {e}")
    
    finally:
        connected_clients.remove(websocket)

# ============================================================================
# STARTUP
# ============================================================================

@app.on_event("startup")
async def startup_event():
    print("🚀 Núcleo Ventures API iniciada")
    print(f"📊 {len(agents_db)} agentes carregados")
    print(f"📝 {len(actions_db)} ações no histórico")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
