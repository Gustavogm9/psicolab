import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePerfilPublico } from "@/hooks/usePerfilPublico";
import { useDepoimentosPublicosMutations } from "@/hooks/useDepoimentosPublicos";
import { PublicWhiteLabelProvider } from "@/components/layout/PublicWhiteLabelProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function EnviarDepoimento() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: perfil, isLoading } = usePerfilPublico(slug);
  const { create, isCreating } = useDepoimentosPublicosMutations();

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [texto, setTexto] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!perfil?.id) {
      toast.error("Perfil não encontrado");
      return;
    }

    if (!nome.trim() || !texto.trim()) {
      toast.error("Por favor, preencha nome e depoimento");
      return;
    }

    try {
      await create({
        perfil_publico_id: perfil.id,
        nome: nome.trim(),
        cargo: cargo.trim() || null,
        empresa: empresa.trim() || null,
        texto: texto.trim(),
        foto: null,
        rating,
        data: new Date().toISOString(),
      });

      setSubmitted(true);
      toast.success(
        '✅ Depoimento enviado com sucesso!',
        {
          description: 'Seu depoimento está em análise e será publicado em breve.'
        }
      );
    } catch (error) {
      console.error("Erro ao enviar depoimento:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">Perfil não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <PublicWhiteLabelProvider userId={perfil.user_id}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-10 pb-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Depoimento Enviado!</h2>
              <p className="text-muted-foreground mb-6">
                Obrigado por compartilhar sua experiência. Seu depoimento está em análise e será publicado em breve.
              </p>
              <Button onClick={() => navigate(`/perfil/${slug}`)}>
                Ver Perfil Público
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicWhiteLabelProvider>
    );
  }

  return (
    <PublicWhiteLabelProvider userId={perfil.user_id}>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Deixe seu Depoimento</CardTitle>
              <CardDescription className="text-base">
                Compartilhe sua experiência trabalhando com{" "}
                <span className="font-medium text-foreground">
                  {perfil.titulo_profissional || "este profissional"}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Seu Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="João Silva"
                    required
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo (opcional)</Label>
                  <Input
                    id="cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Gerente de RH"
                  />
                </div>

                {/* Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa (opcional)</Label>
                  <Input
                    id="empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Empresa XYZ"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Avaliação</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Depoimento */}
                <div className="space-y-2">
                  <Label htmlFor="texto">
                    Seu Depoimento <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="texto"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Conte sobre sua experiência, os resultados obtidos e o que mais destacaria sobre o trabalho..."
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 50 caracteres
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isCreating || texto.length < 50}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Depoimento
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Seu depoimento será revisado antes da publicação
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicWhiteLabelProvider>
  );
}
