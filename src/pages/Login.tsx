import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Por favor, insira um e-mail válido").max(255, "Email muito longo"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa")
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Por favor, insira seu nome").max(100, "Nome muito longo"),
  email: z.string().trim().email("Por favor, insira um e-mail válido").max(255, "Email muito longo"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
  role: z.literal("consultora")
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [role] = useState<UserRole>("consultora");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signIn, signUp } = useAuth();

  // Carousel de frases na coluna esquerda imersiva
  const [activePhraseIdx, setActivePhraseIdx] = useState(0);
  const conversionPhrases = [
    { title: "Capte mais clientes corporativos", desc: "Sua vitrine profissional Whitelabel otimizada para atrair contratos B2B recorrentes." },
    { title: "Diagnósticos automáticos estruturados", desc: "Aplique avaliações científicas de riscos psicossociais e clima em segundos." },
    { title: "Comprove resultados em relatórios de ROI", desc: "Mostre aos diretores de RH a economia real gerada pelas suas intervenções." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhraseIdx((prev) => (prev + 1) % conversionPhrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && userRole) {
      const from = (location.state as any)?.from || `/dashboard/${userRole}`;
      navigate(from, { replace: true });
    }
  }, [user, userRole, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }
    
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("E-mail ou senha incorretos");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor, confirme seu e-mail antes de fazer login");
        } else {
          toast.error(error.message || "Erro ao fazer login");
        }
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("userEmail", email);
      }

      toast.success("Login realizado com sucesso!");
    } catch (error) {
      console.error("Erro inesperado no login:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signUpSchema.parse({ name, email, password, role });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }
    
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name, role);

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Este e-mail já está cadastrado");
        } else if (error.message.includes("Password should be at least")) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
        } else {
          toast.error(error.message || "Erro ao criar conta");
        }
        return;
      }

      toast.success("Conta criada com sucesso! Você já pode fazer login.");
      setIsSignUp(false);
      setPassword("");
      setName("");
    } catch (error) {
      console.error("Erro inesperado no registro:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      
      {/* Estilos locais de Mesh Gradient e transições premium */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mesh1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.15); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes mesh2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-mesh-1 {
          animation: mesh1 20s ease-in-out infinite;
        }
        .animate-mesh-2 {
          animation: mesh2 25s ease-in-out infinite;
        }
        .glass-login-sidebar {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }
        .input-glow-focus:focus-within {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
      `}} />

      {/* 1. COLUNA ESQUERDA: Imersiva e Artística (Nível Apple - Oculta em Mobile) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] relative bg-slate-950 items-center justify-center p-12 overflow-hidden border-r border-white/5 shrink-0">
        
        {/* Líquido Mesh Gradient Dinâmico */}
        <div className="absolute top-[10%] left-[10%] w-[450px] h-[450px] bg-violet-600/20 rounded-full blur-[110px] animate-mesh-1 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[125px] animate-mesh-2 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

        {/* Bloco Central de Conteúdo de Produto */}
        <div className="relative z-10 w-full max-w-lg flex flex-col justify-between h-full py-8 text-left space-y-12">
          
          {/* Top Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white transition-transform hover:scale-102 self-start">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-base shadow-md shadow-primary/20">
              M
            </div>
            <span>MenteMetrics</span>
          </Link>

          {/* Mini Mockup Flutuante em Vidro */}
          <div className="glass-login-sidebar rounded-2xl p-6 shadow-2xl space-y-4 max-w-sm mx-auto w-full select-none animate-float">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Interface MenteMetrics</span>
              </div>
              <div className="h-2 w-16 bg-white/20 rounded" />
            </div>

            <div className="space-y-2.5">
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-4/5 bg-white/10 rounded" />
              <div className="h-1.5 w-1/2 bg-white/5 rounded" />
            </div>

            {/* Simulação de Gráfico de ROI */}
            <div className="h-20 w-full flex items-end gap-1.5 pt-3 border-t border-white/5">
              {[45, 62, 38, 80, 52, 95, 75].map((val, idx) => (
                <div key={idx} className="flex-1 bg-white/10 rounded-t overflow-hidden hover:bg-white/20 transition-colors h-full flex items-end">
                  <div className="w-full bg-gradient-to-t from-primary/80 to-accent/90 rounded-t transition-all duration-1000" style={{ height: `${val}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Frases Dinâmicas com Transições Suaves */}
          <div className="space-y-3.5 min-h-[120px] transition-all duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3 text-accent" />
              Especialistas em B2B
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight transition-all duration-500">
              {conversionPhrases[activePhraseIdx].title}
            </h2>
            <p className="text-sm text-slate-400 font-normal leading-relaxed transition-all duration-500">
              {conversionPhrases[activePhraseIdx].desc}
            </p>
          </div>

          {/* Footer Copyright */}
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            © {new Date().getFullYear()} MenteMetrics B2B. Todos os direitos reservados.
          </span>

        </div>
      </div>

      {/* 2. COLUNA DIREITA: Formulário Glassmorphic / Minimalista */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 relative bg-background">
        
        {/* Botão de Retorno */}
        <Button variant="ghost" asChild className="mb-4 self-start rounded-full hover:bg-muted/50 transition-colors text-xs font-bold uppercase tracking-wider">
          <Link to="/">
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Voltar ao Início
          </Link>
        </Button>

        {/* Mobile Header (Exibe apenas em celular) */}
        <div className="md:hidden text-center mb-6 space-y-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold shadow-md mx-auto">
            M
          </div>
          <h1 className="text-xl font-black text-gradient">MenteMetrics</h1>
        </div>

        {/* Login Card Principal */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <Card className="card-glass border border-border/20 dark:border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-xl w-full transition-all duration-300">
            <CardHeader className="p-0 space-y-2 text-center sm:text-left">
              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
                {isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-normal leading-relaxed">
                {isSignUp 
                  ? "Insira seus dados para começar a atuar com empresas."
                  : "Insira suas credenciais de psicólogo para acessar o painel."
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0 pt-6 space-y-4">
              <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4 text-left">
                
                {isSignUp && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Nome Completo</Label>
                    <div className="input-premium-wrapper rounded-xl border border-border/60 bg-background/50 overflow-hidden transition-all duration-300">
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 px-4 text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">E-mail Corporativo</Label>
                  <div className="flex items-center input-premium-wrapper rounded-xl border border-border/60 bg-background/50 overflow-hidden transition-all duration-300 px-4">
                    <Mail className="h-4 w-4 text-muted-foreground/75 shrink-0" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 pl-2 pr-0 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Senha de Acesso</Label>
                    {!isSignUp && (
                      <Link to="/recuperar-senha" className="text-xs text-primary hover:text-accent font-semibold transition-colors">
                        Esqueceu?
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center input-premium-wrapper rounded-xl border border-border/60 bg-background/50 overflow-hidden transition-all duration-300 px-4">
                    <Lock className="h-4 w-4 text-muted-foreground/75 shrink-0" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Insira sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 pl-2 pr-2 text-sm"
                      required
                    />
                    <button
                      type="button"
                      className="text-muted-foreground/70 hover:text-foreground shrink-0 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center space-x-2.5 pt-1">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="rounded-md border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                    >
                      Manter-me conectado
                    </Label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold tracking-wider rounded-xl h-11 shadow-lg shadow-primary/10 mt-3 btn-shine-effect text-xs uppercase btn-premium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Cadastrando..." : "Autenticando..."}
                    </>
                  ) : (
                    isSignUp ? "Criar Minha Conta" : "Entrar no Sistema"
                  )}
                </Button>
              </form>

              <Separator className="my-6 border-border/40" />

              {/* Botão de Alternância do Form */}
              <div className="text-center text-xs text-muted-foreground font-medium">
                {isSignUp ? (
                  <>
                    Já tem uma conta de psicólogo?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-primary hover:text-accent hover:underline font-bold transition-all ml-1.5"
                    >
                      Fazer Login
                    </button>
                  </>
                ) : (
                  <>
                    Não possui uma credencial?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-primary hover:text-accent hover:underline font-bold transition-all ml-1.5"
                    >
                      Criar Conta Gratuita
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Link */}
        <div className="text-center text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider mt-6 md:mt-0 select-none">
          Ao continuar, você concorda com os{" "}
          <Link to="/termos" className="underline hover:text-foreground transition-colors">Termos</Link> e{" "}
          <Link to="/privacidade" className="underline hover:text-foreground transition-colors">Privacidade</Link>.
        </div>

      </div>

    </div>
  );
}