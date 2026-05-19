import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/30 to-secondary-soft/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
        </Button>

        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient">PsiColab</h1>
        </div>

        {/* Login/SignUp Form */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isSignUp ? "Criar Conta" : "Entrar"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? "Preencha os dados para criar sua conta"
                : "Acesse sua conta para continuar"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isSignUp && (
                    <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Lembrar de mim
                  </Label>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Criando conta..." : "Entrando..."}
                  </>
                ) : (
                  isSignUp ? "Criar Conta" : "Entrar"
                )}
              </Button>
            </form>


            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              {isSignUp ? (
                <>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </button>
                </>
              ) : (
                <>
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Criar conta gratuita
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}