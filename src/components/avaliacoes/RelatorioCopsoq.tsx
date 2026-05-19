import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, AlertTriangle, Activity, ShieldAlert, Award, Info, TrendingUp, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as RechartsTooltip } from 'recharts';
import type { ResultadoCopsoq, Semaforo, TipoSubescala, SubescalaCopsoq } from "@/hooks/useCopsoqRelatorio";

interface RelatorioCopsoqProps {
    resultado: ResultadoCopsoq;
    taxaResposta?: number;
    totalFiltrado?: number;
}

// ─── Helpers de apresentação ───────────────────────────────────────────────

const COR_SEMAFORO: Record<Semaforo, string> = {
    verde: "#22c55e",    // green-500
    amarelo: "#facc15",  // yellow-400
    vermelho: "#ef4444", // red-500
};

const COR_BG: Record<Semaforo, string> = {
    verde: "bg-green-500",
    amarelo: "bg-yellow-400",
    vermelho: "bg-red-500",
};

const COR_TEXTO_CARD: Record<Semaforo, string> = {
    verde: "text-white",
    amarelo: "text-yellow-950",
    vermelho: "text-white",
};

const LABEL_SEMAFORO: Record<Semaforo, string> = {
    verde: "Favorável",
    amarelo: "Atenção",
    vermelho: "Crítico",
};

function labelClassificacaoGeral(score: number): { texto: string; cor: string; bg: string } {
    if (score >= 66.67) return { texto: "Risco Elevado", cor: "text-red-700", bg: "bg-red-100" };
    if (score > 33.33) return { texto: "Risco Moderado", cor: "text-yellow-700", bg: "bg-yellow-100" };
    return { texto: "Risco Baixo", cor: "text-green-700", bg: "bg-green-100" };
}

// ─── Componente ────────────────────────────────────────────────────────────

export function RelatorioCopsoq({ resultado, taxaResposta, totalFiltrado }: RelatorioCopsoqProps) {
    const [showInfoModal, setShowInfoModal] = useState(false);
    const classGeral = labelClassificacaoGeral(resultado.scoreGeral);

    // Subescalas por tipo para o modal explicativo
    const todasSubescalas = resultado.dominios.flatMap(d => d.subescalas);
    const subescalasRisco = todasSubescalas.filter(s => s.tipo === 'risco');
    const subescalasProtetivas = todasSubescalas.filter(s => s.tipo === 'protetivo');
    const somaRisco = subescalasRisco.reduce((acc, s) => acc + s.media, 0);
    const somaProtetivosComoRisco = subescalasProtetivas.reduce((acc, s) => acc + (100 - s.media), 0);
    const totalPontos = somaRisco + somaProtetivosComoRisco;
    const totalSubescalas = todasSubescalas.length;

    // Preparar dados para o gráfico Radar (Índice de Risco por Domínio)
    const radarData = resultado.dominios.map(d => {
        const riscoMedio = d.subescalas.length > 0
            ? d.subescalas.reduce((acc, sub) => {
                return acc + (sub.tipo === "risco" ? sub.media : (100 - sub.media));
            }, 0) / d.subescalas.length
            : 0;

        // Truncar nome para não quebrar o gráfico
        let shortName = d.nome;
        if (shortName.length > 20) {
            shortName = shortName.substring(0, 20) + '...';
        }

        return {
            dominio: shortName,
            nomeCompleto: d.nome,
            risco: parseFloat(riscoMedio.toFixed(1)),
        };
    });

    // Pega todas as subescalas para a lista do seмáforo (pode reusar todasSubescalas de cima)

    return (
        <div className="space-y-8 pb-10">
            {/* ── Top Header Cards ─────────────────────────────────────────────────── */}
            <div className={`grid grid-cols-1 gap-4 ${taxaResposta !== undefined ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Users className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Respondentes</p>
                        <h3 className="text-3xl font-bold mt-1">{resultado.totalRespondentes}</h3>
                    </CardContent>
                </Card>

                {taxaResposta !== undefined && (
                    <Card className="shadow-sm">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                            <Activity className="h-6 w-6 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">Taxa de Adesão</p>
                            <h3 className="text-3xl font-bold mt-1">{taxaResposta.toFixed(1)}%</h3>
                            <Progress value={taxaResposta} className="h-1 mt-3 w-3/4 mx-auto" />
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Award className="h-6 w-6 text-muted-foreground mb-2" />
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-muted-foreground">Índice Geral de Risco</p>
                            <button
                                onClick={() => setShowInfoModal(true)}
                                className="flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors w-5 h-5"
                                title="Como este índice é calculado?"
                            >
                                <Info className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <h3 className="text-3xl font-bold mt-1">{resultado.scoreGeral.toFixed(1)}</h3>
                    </CardContent>
                </Card>

                {/* Dialog Explicativo do Índice Geral */}
                <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Info className="h-5 w-5 text-primary" />
                                Como o Índice Geral de Risco é calculado?
                            </DialogTitle>
                            <DialogDescription>
                                Uma métrica composta que equilibra os fatores de risco e proteção do instrumento COPSOQ II.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 pt-2">
                            {/* Passo 1 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-700 text-xs font-bold shrink-0">1</div>
                                    <h4 className="font-semibold text-slate-800">Fatores de Risco somam pontos diretamente</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Subescalas onde “mais” é ruim, como <strong>Burnout</strong>, <strong>Stress</strong> e <strong>Exigências Quantitativas</strong>. O valor medido (0-100) entra diretamente no índice.
                                </p>
                                <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm">
                                    <div className="flex items-center justify-between text-red-700">
                                        <span className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /><strong>{subescalasRisco.length} fatores de risco</strong></span>
                                        <span className="font-mono font-bold">Soma: {somaRisco.toFixed(1)} pts</span>
                                    </div>
                                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                        {subescalasRisco.map(s => (
                                            <div key={s.nome} className="flex justify-between text-xs text-red-800">
                                                <span>{s.nome}</span>
                                                <span className="font-semibold">{s.media.toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Passo 2 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-700 text-xs font-bold shrink-0">2</div>
                                    <h4 className="font-semibold text-slate-800">Fatores Protetivos são invertidos (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">100 - valor</code>)</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Subescalas onde “mais” é bom, como <strong>Apoio Social</strong>, <strong>Satisfação Laboral</strong> e <strong>Qualidade da Liderança</strong>. Se a nota é alta, o
                                    risco é baixo, por isso usamos <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">100 - nota</code>.
                                </p>
                                <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm">
                                    <div className="flex items-center justify-between text-green-700">
                                        <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /><strong>{subescalasProtetivas.length} fatores protetivos</strong></span>
                                        <span className="font-mono font-bold">Soma de risco: {somaProtetivosComoRisco.toFixed(1)} pts</span>
                                    </div>
                                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                        {subescalasProtetivas.map(s => (
                                            <div key={s.nome} className="flex justify-between text-xs text-green-800">
                                                <span>{s.nome}</span>
                                                <span className="font-semibold">{s.media.toFixed(0)} → risco: {(100 - s.media).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Passo 3 — a conta final */}
                            <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">3</div>
                                    <h4 className="font-semibold text-slate-800">Cálculo final: a média aritmética</h4>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-center font-mono text-base">
                                    <div className="bg-white border rounded p-2">
                                        <div className="text-xs text-muted-foreground mb-0.5">Total de pontos</div>
                                        <div className="font-bold text-slate-800">{totalPontos.toFixed(1)}</div>
                                    </div>
                                    <span className="text-muted-foreground text-xl">÷</span>
                                    <div className="bg-white border rounded p-2">
                                        <div className="text-xs text-muted-foreground mb-0.5">Número de subescalas</div>
                                        <div className="font-bold text-slate-800">{totalSubescalas}</div>
                                    </div>
                                    <span className="text-muted-foreground text-xl">=</span>
                                    <div className={`border-2 rounded p-2 ${resultado.scoreGeral >= 66.67 ? 'border-red-400 bg-red-50' : resultado.scoreGeral > 33.33 ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'}`}>
                                        <div className="text-xs text-muted-foreground mb-0.5">Índice Geral</div>
                                        <div className="font-bold text-2xl text-slate-800">{resultado.scoreGeral.toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Card className="shadow-sm border-t-4" style={{ borderTopColor: classGeral.bg === 'bg-red-100' ? '#ef4444' : classGeral.bg === 'bg-yellow-100' ? '#facc15' : '#22c55e' }}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <ShieldAlert className={`h-6 w-6 mb-2 ${classGeral.cor}`} />
                        <p className="text-sm font-medium text-muted-foreground mb-2">Classificação</p>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${classGeral.bg} ${classGeral.cor}`}>
                            {classGeral.texto}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Top 5 Dimensões Críticas ──────────────────────────────────────────── */}
            <Card className="shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Top 5 Dimensões Críticas
                    </CardTitle>
                    <CardDescription>
                        Fatores com os maiores índices de risco psicossocial (100 = risco máximo).
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {resultado.top5Criticas.map((sub, idx) => (
                            <li key={sub.nome} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                                    <span className="font-medium text-slate-800">{sub.nome}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
                                        {LABEL_SEMAFORO[sub.semaforo]}
                                    </span>
                                    <span className="text-base font-semibold text-slate-700">
                                        {(sub.tipo === 'risco' ? sub.media : (100 - sub.media)).toFixed(1)}
                                    </span>
                                    <div className={`h-3 w-3 rounded-full ${COR_BG[sub.semaforo]}`} />
                                </div>
                            </li>
                        ))}
                        {resultado.top5Criticas.length === 0 && (
                            <div className="p-6 text-center text-muted-foreground">
                                Dados insuficientes para gerar o Top 5.
                            </div>
                        )}
                    </ul>
                </CardContent>
            </Card>

            {/* ── Semáforo e Radar (Grid 2 colunas) ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Semáforo por Subescala */}
                <Card className="shadow-sm flex flex-col">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg">Semáforo por Subescala</CardTitle>
                        <CardDescription>Média (0-100) e classificação de todas as subescalas.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-y-auto max-h-[450px]">
                        <div className="divide-y">
                            {todasSubescalas.map((sub) => (
                                <div key={sub.nome} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                                    <div className="w-1/3 min-w-[120px]">
                                        <p className="text-xs font-medium text-slate-700 truncate" title={sub.nome}>
                                            {sub.nome}
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-4 w-full bg-slate-100 rounded-sm overflow-hidden flex">
                                            <div
                                                className={`h-full transition-all ${COR_BG[sub.semaforo]}`}
                                                style={{ width: `${sub.media}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right shrink-0 flex flex-col items-end justify-center">
                                        <span className="text-xs font-semibold text-slate-700 leading-none">{sub.media.toFixed(0)}</span>
                                        <span className="text-[10px] text-muted-foreground mt-1 leading-none">{LABEL_SEMAFORO[sub.semaforo]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card className="shadow-sm flex flex-col">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg">Radar de Risco por Dimensão</CardTitle>
                        <CardDescription>Visão agregada do nível de risco (0-100) em cada domínio maior.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 flex items-center justify-center min-h-[350px]">
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis
                                        dataKey="dominio"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                    />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 100]}
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    />
                                    <Radar
                                        name="Risco Médio"
                                        dataKey="risco"
                                        stroke="#8b5cf6" // Violet-500
                                        fill="#a78bfa"   // Violet-400
                                        fillOpacity={0.4}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: number) => [`${value} / 100`, 'Índice de Risco']}
                                        labelFormatter={(label, payload) => {
                                            if (payload && payload.length > 0) {
                                                return payload[0].payload.nomeCompleto;
                                            }
                                            return label;
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* ── Heatmap Organizacional ────────────────────────────────────────────── */}
            <Card className="shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg">Heatmap Organizacional</CardTitle>
                    <CardDescription>Mapeamento visual direto de todas as áreas (Valores de 0 a 100).</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-8">
                        {resultado.dominios.map((dominio) => (
                            <div key={dominio.nome}>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    {dominio.nome}
                                </h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {dominio.subescalas.map((sub) => (
                                        <div
                                            key={sub.nome}
                                            className={`p-4 rounded-md flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] shadow-sm ${COR_BG[sub.semaforo]} ${COR_TEXTO_CARD[sub.semaforo]}`}
                                        >
                                            <span className="text-xs font-medium mb-1 opacity-90">{sub.nome}</span>
                                            <span className="text-2xl font-bold tracking-tight leading-none">{sub.media.toFixed(0)}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80 mt-1">{LABEL_SEMAFORO[sub.semaforo]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
