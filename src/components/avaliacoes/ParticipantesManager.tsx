import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Upload, Trash2, Mail, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useParticipantes, useParticipanteCreate, useParticipantesBulkCreate, useParticipanteDelete } from '@/hooks/useParticipantes';
import { useEnviarConvites } from '@/hooks/useEnviarConvites';
import { toast } from '@/hooks/use-toast';

interface ParticipantesManagerProps {
  avaliacaoId: string;
}

interface PreviewParticipante {
  nome: string;
  email: string;
  valido: boolean;
  duplicado: boolean;
  linha: number;
}

export const ParticipantesManager = ({ avaliacaoId }: ParticipantesManagerProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [listaEmails, setListaEmails] = useState('');

  const { data: participantes = [], isLoading } = useParticipantes(avaliacaoId);
  const { mutate: createParticipante, isPending: isCreating } = useParticipanteCreate();
  const { mutate: createBulk, isPending: isCreatingBulk } = useParticipantesBulkCreate();
  const { mutate: deleteParticipante } = useParticipanteDelete();
  const { mutate: enviarConvites, isPending: isEnviando } = useEnviarConvites();

  const validarEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Preview em tempo real da lista de participantes
  const previewParticipantes = useMemo((): PreviewParticipante[] => {
    if (!listaEmails.trim()) return [];

    const linhas = listaEmails.split('\n');
    const emailsExistentes = new Set(participantes.map(p => p.email.toLowerCase()));
    const emailsNaLista = new Set<string>();
    const preview: PreviewParticipante[] = [];

    linhas.forEach((linha, index) => {
      const linhaLimpa = linha.trim();
      if (!linhaLimpa) return;

      const partes = linhaLimpa.split(',').map(p => p.trim());
      let emailTemp = '';
      let nomeTemp = '';

      if (partes.length >= 2) {
        nomeTemp = partes[0];
        emailTemp = partes[1];
      } else if (partes.length === 1) {
        const parte = partes[0];
        if (validarEmail(parte)) {
          emailTemp = parte;
          nomeTemp = parte.split('@')[0];
        } else {
          // Linha inválida - não é email nem formato nome,email
          preview.push({
            nome: linhaLimpa,
            email: '',
            valido: false,
            duplicado: false,
            linha: index + 1
          });
          return;
        }
      }

      const emailLower = emailTemp.toLowerCase();
      const jaExiste = emailsExistentes.has(emailLower);
      const duplicadoNaLista = emailsNaLista.has(emailLower);
      const emailValido = validarEmail(emailTemp);

      preview.push({
        nome: nomeTemp,
        email: emailTemp,
        valido: emailValido && !jaExiste && !duplicadoNaLista,
        duplicado: jaExiste || duplicadoNaLista,
        linha: index + 1
      });

      if (emailValido) {
        emailsNaLista.add(emailLower);
      }
    });

    return preview;
  }, [listaEmails, participantes]);

  const validosCount = previewParticipantes.filter(p => p.valido).length;
  const invalidosCount = previewParticipantes.filter(p => !p.valido).length;

  const handleAdicionarIndividual = () => {
    if (!nome.trim() || !email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e email do participante",
        variant: "destructive",
      });
      return;
    }

    if (!validarEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido (exemplo: nome@empresa.com)",
        variant: "destructive",
      });
      return;
    }

    createParticipante(
      { avaliacaoId, nome, email },
      {
        onSuccess: () => {
          setNome('');
          setEmail('');
          toast({
            title: "Participante adicionado",
            description: `${nome} foi adicionado com sucesso`,
          });
        },
      }
    );
  };

  const handleImportarLista = () => {
    if (!listaEmails.trim()) {
      toast({
        title: "Lista vazia",
        description: "Cole ou digite a lista de participantes antes de importar",
        variant: "destructive",
      });
      return;
    }

    const participantesValidos = previewParticipantes.filter(p => p.valido);

    if (participantesValidos.length === 0) {
      toast({
        title: "Nenhum participante válido",
        description: "Verifique o formato: Nome, email@empresa.com (um por linha)",
        variant: "destructive",
      });
      return;
    }

    const participantesNovos = participantesValidos.map(p => ({
      nome: p.nome,
      email: p.email
    }));

    createBulk(
      { avaliacaoId, participantes: participantesNovos },
      {
        onSuccess: () => {
          const ignorados = invalidosCount;
          if (ignorados > 0) {
            toast({
              title: `${participantesNovos.length} participante(s) importado(s)`,
              description: `${ignorados} linha(s) ignorada(s) por formato inválido ou duplicado`,
            });
          } else {
            toast({
              title: "Importação concluída",
              description: `${participantesNovos.length} participante(s) adicionado(s) com sucesso`,
            });
          }
          setListaEmails('');
        },
      }
    );
  };

  const handleEnviarConvites = (participanteIds?: string[]) => {
    enviarConvites({ avaliacaoId, participanteIds });
  };

  const handleRemover = (participanteId: string) => {
    if (confirm('Tem certeza que deseja remover este participante?')) {
      deleteParticipante({ avaliacaoId, participanteId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Participantes</CardTitle>
          <CardDescription>
            Adicione participantes que receberão acesso individual à avaliação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="importar">Importar Lista</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do participante"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAdicionarIndividual} disabled={isCreating} className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                {isCreating ? 'Adicionando...' : 'Adicionar Participante'}
              </Button>
            </TabsContent>

            <TabsContent value="importar" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lista">Lista de Participantes</Label>
                <p className="text-sm text-muted-foreground">
                  Um participante por linha. Formato: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Nome, email</code> ou apenas <code className="bg-muted px-1.5 py-0.5 rounded text-xs">email</code>
                </p>
                <Textarea
                  id="lista"
                  placeholder={`João Silva, joao@empresa.com\nMaria Santos, maria@empresa.com\npedro@empresa.com`}
                  value={listaEmails}
                  onChange={(e) => setListaEmails(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              {/* Preview de validação em tempo real */}
              {previewParticipantes.length > 0 && (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Prévia da importação</p>
                    <div className="flex items-center gap-3 text-xs">
                      {validosCount > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {validosCount} válido(s)
                        </span>
                      )}
                      {invalidosCount > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          {invalidosCount} ignorado(s)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {previewParticipantes.slice(0, 10).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-0.5">
                        {p.valido ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        <span className={p.valido ? 'text-foreground' : 'text-muted-foreground line-through'}>
                          {p.nome}{p.email && ` - ${p.email}`}
                        </span>
                        {p.duplicado && (
                          <span className="text-xs text-muted-foreground">(duplicado)</span>
                        )}
                        {!p.valido && !p.duplicado && !p.email && (
                          <span className="text-xs text-muted-foreground">(formato inválido)</span>
                        )}
                      </div>
                    ))}
                    {previewParticipantes.length > 10 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        ... e mais {previewParticipantes.length - 10} linha(s)
                      </p>
                    )}
                  </div>

                  {invalidosCount > 0 && (
                    <div className="flex items-start gap-2 pt-2 border-t text-xs text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Linhas com formato inválido ou emails duplicados serão ignoradas</span>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleImportarLista} 
                disabled={isCreatingBulk || validosCount === 0} 
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isCreatingBulk ? 'Importando...' : `Importar ${validosCount > 0 ? `${validosCount} Participante(s)` : 'Lista'}`}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Participantes Cadastrados</CardTitle>
              <CardDescription>
                Total: {participantes.length} participante(s)
              </CardDescription>
            </div>
            {participantes.length > 0 && (
              <Button onClick={() => handleEnviarConvites()} disabled={isEnviando}>
                <Mail className="h-4 w-4 mr-2" />
                {isEnviando ? 'Enviando...' : 'Enviar Todos os Convites'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {participantes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum participante cadastrado ainda
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participantes.map((participante) => (
                    <TableRow key={participante.id}>
                      <TableCell className="font-medium">{participante.nome}</TableCell>
                      <TableCell>{participante.email}</TableCell>
                      <TableCell>
                        {participante.respondido ? (
                          <Badge variant="default">Respondido</Badge>
                        ) : participante.data_convite ? (
                          <Badge variant="secondary">Convite Enviado</Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEnviarConvites([participante.id])}
                            disabled={isEnviando}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemover(participante.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
