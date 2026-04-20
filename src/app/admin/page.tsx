"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Bell, 
  BellOff, 
  Trash2, 
  Send, 
  Package, 
  RefreshCw, 
  ShieldCheck, 
  Lock,
  ChevronRight,
  User as UserIcon,
  Calendar,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const API = "https://699107e56279728b0153afac.mockapi.io/Telegran";
const ADMIN_PASSWORD = "admin123";

type User = {
  id: string;
  chatId: number;
  notificationsEnabled: boolean;
  notificationDay: number;
  notificationHour: number;
  lastNotificationSent?: string;
  name?: string;
  photoUrl?: string;
};

const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const horas = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const loadUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      
      // Fetch extra info from Telegram for each user
      const usersWithInfo = await Promise.all(data.map(async (user: User) => {
        try {
          const infoRes = await fetch('/api/telegram/get-user-info', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId: user.chatId })
          });
          const info = await infoRes.json();
          return { ...user, name: info.name, photoUrl: info.photoUrl };
        } catch {
          return { ...user, name: "Usuário Desconhecido" };
        }
      }));
      
      setUsers(usersWithInfo);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const sendMaterial = async (chatId: number) => {
    try {
      await fetch('/api/telegram/send-material', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId })
      });
      alert("Material enviado com sucesso! 📦");
    } catch (error) {
      alert("Erro ao enviar material.");
    }
  };

  const sendMessage = async (chatId: number, userId: string) => {
    const text = messages[userId];
    if (!text) return alert("Digite uma mensagem!");

    try {
      const res = await fetch('/api/telegram/send-message', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, text })
      });
      const data = await res.json();
      if (data.ok) {
        alert("Mensagem enviada! 🚀");
        setMessages({ ...messages, [userId]: "" });
      } else {
        alert("Erro ao enviar mensagem.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
           <CardHeader className="relative z-10 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <Lock className="text-primary" size={32} />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Acesso Administrativo</CardTitle>
            <CardDescription className="text-slate-400">Insira sua senha para gerenciar as notificações.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Senha de acesso" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 transition-all"
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                Entrar no Painel
              </Button>
            </form>
          </CardContent>
          <CardFooter className="relative z-10 justify-center">
             <p className="text-xs text-slate-500 flex items-center gap-1">
               <ShieldCheck size={12} /> Conexão Segura
             </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-primary/30 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                <Users className="text-primary" size={32} />
              </div>
              Usuários Cadastrados
            </h1>
            <p className="text-slate-400 mt-2">Gerencie as notificações automáticas e comunicação direta via Telegram.</p>
          </div>
          <Button 
            onClick={loadUsers} 
            disabled={refreshing}
            variant="outline" 
            className="border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm self-start md:self-center"
          >
            {refreshing ? <Loader2 className="animate-spin mr-2" size={18} /> : <RefreshCw className="mr-2" size={18} />}
            Atualizar Lista
          </Button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <Card key={user.id} className="group border-white/10 bg-white/5 backdrop-blur-md hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border border-white/10">
                          <AvatarImage src={user.photoUrl} alt={user.name} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            <UserIcon size={20} />
                          </AvatarFallback>
                        </Avatar>
                        {user.notificationsEnabled && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white font-semibold truncate max-w-[150px]">{user.name}</CardTitle>
                        <CardDescription className="text-slate-500 font-mono text-xs">{user.chatId}</CardDescription>
                      </div>
                    </div>
                    <Badge className={cn(
                      "font-medium",
                      user.notificationsEnabled ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                    )}>
                      {user.notificationsEnabled ? "Ativo" : "Desativado"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 flex-grow">
                  {/* Scheduling Section */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <Calendar size={10} /> Dia do Envio
                      </label>
                      <Select 
                        value={String(user.notificationDay)} 
                        onValueChange={(val) => updateUser(user.id, { notificationDay: Number(val) })}
                      >
                        <SelectTrigger className="h-9 bg-transparent border-white/10 text-xs focus:ring-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                          {dias.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={10} /> Hora do Envio
                      </label>
                      <Select 
                        value={String(user.notificationHour)} 
                        onValueChange={(val) => updateUser(user.id, { notificationHour: Number(val) })}
                      >
                        <SelectTrigger className="h-9 bg-transparent border-white/10 text-xs focus:ring-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                          {horas.map(h => <SelectItem key={h} value={String(h)}>{h}h:00</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Messaging Section */}
                  <div className="space-y-3">
                    <Input 
                      placeholder="Mensagem direta..." 
                      value={messages[user.id] || ""}
                      onChange={(e) => setMessages({ ...messages, [user.id]: e.target.value })}
                      className="h-10 bg-white/5 border-white/10 text-sm placeholder:text-slate-600 focus:border-primary/50"
                    />
                    <div className="grid grid-cols-2 gap-2">
                       <Button 
                        size="sm"
                        onClick={() => sendMessage(user.chatId, user.id)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        <Send size={14} className="mr-2" /> Mensagem
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => sendMaterial(user.chatId)}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                      >
                        <Package size={14} className="mr-2" /> Material
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={user.notificationsEnabled} 
                      onCheckedChange={(checked) => updateUser(user.id, { notificationsEnabled: checked })}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-xs text-slate-400 font-mediumSmall">
                      Notificações
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteUser(user.id)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white">Nenhum usuário encontrado</h3>
            <p className="text-slate-500 mt-2">Os usuários aparecerão aqui quando iniciarem conversa com o bot.</p>
          </div>
        )}
      </div>
    </div>
  );
}
