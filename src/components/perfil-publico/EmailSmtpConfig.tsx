import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, EyeOff, Save, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function EmailSmtpConfig() {
    const { effectiveUserId } = useAuth();
    const [smtpEmail, setSmtpEmail] = useState("");
    const [smtpPassword, setSmtpPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasConfig, setHasConfig] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            if (!effectiveUserId) return;
            const { data } = await (supabase
                .from("profiles")
                .select("smtp_email, smtp_app_password") as any)
                .eq("id", effectiveUserId)
                .maybeSingle();

            if (data?.smtp_email) {
                setSmtpEmail(data.smtp_email);
                setHasConfig(true);
                // Não carregamos a senha por segurança — só indicamos que está configurada
            }
            setIsLoading(false);
        };
        loadConfig();
    }, [effectiveUserId]);

    const handleSave = async () => {
        if (!effectiveUserId) return;

        if (!smtpEmail || !smtpPassword) {
            toast.error("Preencha o email e a App Password");
            return;
        }


        if (smtpPassword.length < 16) {
            toast.error("A App Password do Google tem 16 caracteres. Verifique se está correta.");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await (supabase
                .from("profiles") as any)
                .update({
                    smtp_email: smtpEmail.trim(),
                    smtp_app_password: smtpPassword.replace(/\s/g, ""),
                })
                .eq("id", effectiveUserId);

            if (error) throw error;

            setHasConfig(true);
            setSmtpPassword(""); // Limpar por segurança após salvar
            toast.success("Email configurado com sucesso! Seus emails serão enviados a partir deste endereço.");
        } catch (error: any) {
            toast.error(`Erro ao salvar: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!effectiveUserId) return;
        setIsSaving(true);
        try {
            await (supabase
                .from("profiles") as any)
                .update({ smtp_email: null, smtp_app_password: null })
                .eq("id", effectiveUserId);

            setSmtpEmail("");
            setSmtpPassword("");
            setHasConfig(false);
            toast.success("Configuração de email removida. Emails serão enviados via plataforma.");
        } catch (error: any) {
            toast.error(`Erro ao remover: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {hasConfig && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-400">
                        <strong>Email configurado:</strong> {smtpEmail || "Gmail corporativo"}
                        <br />
                        Seus questionários e convites de avaliação serão enviados a partir deste endereço.
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="smtp-email">Email Gmail Corporativo</Label>
                    <Input
                        id="smtp-email"
                        type="email"
                        placeholder="seunome@gmail.com ou contato@seudominio.com.br"
                        value={smtpEmail}
                        onChange={(e) => setSmtpEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Email Gmail (pessoal ou corporativo via Google Workspace) que será usado como remetente.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="smtp-password">
                        App Password do Google
                        {hasConfig && (
                            <Badge variant="secondary" className="ml-2 text-xs">Já configurada</Badge>
                        )}
                    </Label>
                    <div className="relative">
                        <Input
                            id="smtp-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={hasConfig ? "Digite para alterar a senha" : "xxxx xxxx xxxx xxxx"}
                            value={smtpPassword}
                            onChange={(e) => setSmtpPassword(e.target.value)}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Não é sua senha normal do Gmail. É uma senha de aplicativo gerada especificamente para isso.
                    </p>
                </div>

                {/* Instruções */}
                <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription className="space-y-2">
                        <p className="font-medium">Como gerar a App Password:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                            <li>Acesse <strong>myaccount.google.com</strong> no Gmail que deseja usar</li>
                            <li>Ative a <strong>Verificação em 2 etapas</strong> (se ainda não tiver)</li>
                            <li>Vá em <strong>Segurança → App Passwords</strong></li>
                            <li>Selecione "Outro (nome personalizado)", coloque "PsiColab"</li>
                            <li>Copie a senha de 16 caracteres gerada e cole aqui</li>
                        </ol>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open("https://myaccount.google.com/apppasswords", "_blank")}
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir App Passwords do Google
                        </Button>
                    </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving || !smtpEmail || !smtpPassword}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isSaving ? "Salvando..." : "Salvar Configuração"}
                    </Button>
                    {hasConfig && (
                        <Button variant="outline" onClick={handleRemove} disabled={isSaving}>
                            Usar email da plataforma
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
