"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogClose } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { 
  Wrench,
  Network,
  Server,
  Search,
  Router,
  Spline,
  Map,
  FilePenLine,
  MapPin,
  Globe,
  Gauge,
  QrCode,
  PackagePlus,
  ExternalLink,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tool Button Component
const ToolButton = ({ onClick, href, icon, title, primary = false }: { onClick?: () => void; href?: string; icon: React.ReactNode; title: string; primary?: boolean }) => {
  const commonProps = {
    className: cn(
      "group relative flex flex-col items-center justify-center w-full h-32 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-center text-foreground transition-all duration-300 ease-in-out overflow-hidden hover:border-primary hover:bg-primary/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1",
      primary && "border-primary/50 bg-primary/10"
    ),
    onClick: onClick
  };
  
  const content = (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="mb-2 text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
       <div className="absolute -bottom-1/2 -right-1/2 w-3/4 h-3/4 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
        {content}
      </a>
    );
  }

  return <button {...commonProps}>{content}</button>;
};

// Map Icon Component
const MapIconButton = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-background border border-white/10 transition-all duration-300 hover:bg-primary hover:border-primary hover:scale-110"
  >
    <div className="text-secondary group-hover:text-primary-foreground transition-colors">
      {icon}
    </div>
  </a>
);


export default function Home() {
  const [indaiaModalOpen, setIndaiaModalOpen] = useState(false);
  const [speedtestModalOpen, setSpeedtestModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [hostUrl, setHostUrl] = useState('#');
  const [hostText, setHostText] = useState('Gerenciando Host...');
  const [ipInfo, setIpInfo] = useState({ ipv4: '', ipv6: '', location: '' });
  const [ipInfoLoading, setIpInfoLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');

  useEffect(() => {
    if (!isMounted) return;

    async function getLocalIP() {
      // Logic from original file...
      // wrapped in a try/catch to avoid browser errors
      try {
        const conn = new RTCPeerConnection({ iceServers: [] });
        conn.createDataChannel('');
        const offer = await conn.createOffer();
        await conn.setLocalDescription(offer);
        return new Promise<string | null>((resolve) => {
          let timeout = setTimeout(() => {
            conn.close();
            resolve(null);
          }, 1000);
          conn.onicecandidate = (ice) => {
            if (ice?.candidate?.candidate) {
              const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
              if (ipMatch) {
                const ip = ipMatch[1];
                if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
                  clearTimeout(timeout);
                  conn.close();
                  resolve(ip);
                }
              }
            }
          };
        });
      } catch (error) {
        console.error("WebRTC not supported or blocked:", error);
        return null;
      }
    }

    async function setupHostButton() {
      const localIP = await getLocalIP();
      if (localIP) {
        const parts = localIP.split('.');
        const gateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
        setHostUrl(`http://${gateway}/`);
        setHostText(`(${gateway}) Roteador`);
      } else {
        setHostUrl('https://www.noip.com/pt-BR');
        setHostText('Gerenciar Host');
      }
    }

    setupHostButton();
  }, [isMounted]);

  async function fetchIpInfo() {
    setIpInfoLoading(true);
    try {
      const ipv4Response = await fetch('https://api.ipify.org?format=json');
      const ipv4Data = await ipv4Response.json();
      const ipv4 = ipv4Data.ip;
      
      let ipv6 = 'Não disponível';
      try {
        const ipv6Response = await fetch('https://api64.ipify.org?format=json');
        const ipv6Data = await ipv6Response.json();
        ipv6 = ipv6Data.ip;
      } catch (e) {
        // Silently fail if no IPv6
      }

      const geoResponse = await fetch(`https://ipapi.co/${ipv4}/json/`);
      const geoData = await geoResponse.json();
      const location = `${geoData.city || 'N/A'}, ${geoData.region || 'N/A'}, ${geoData.country_name || 'N/A'}`;

      setIpInfo({ ipv4, ipv6, location });
    } catch (err) {
      setIpInfo({ ipv4: 'Erro', ipv6: 'Erro', location: 'Não foi possível carregar dados' });
    } finally {
      setIpInfoLoading(false);
    }
  }

  const handleOpenSpeedtest = () => {
    setSpeedtestModalOpen(true);
    fetchIpInfo();
  }
  
  if (!isMounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden">
      <div className="absolute inset-0 animate-aurora [--aurora-size:400px] opacity-20" style={{
        backgroundImage: 'radial-gradient(var(--aurora-size) circle at var(--primary-x, 50%) var(--primary-y, 50%), hsl(var(--primary)), transparent 50%), radial-gradient(var(--aurora-size) circle at var(--secondary-x, 50%) var(--secondary-y, 50%), hsl(var(--secondary)), transparent 50%)',
      }} onMouseMove={(e) => {
          const target = e.currentTarget;
          target.style.setProperty('--primary-x', `${e.clientX - target.offsetLeft}px`);
          target.style.setProperty('--primary-y', `${e.clientY - target.offsetTop}px`);
          target.style.setProperty('--secondary-x', `${(window.innerWidth - e.clientX) - target.offsetLeft}px`);
          target.style.setProperty('--secondary-y', `${(window.innerHeight - e.clientY) - target.offsetTop}px`);
      }}></div>
      
      <main className="relative z-10 p-4 sm:p-6 md:p-8 animate-slide-up opacity-0" style={{animationFillMode: 'forwards'}}>
        <div className="max-w-4xl mx-auto bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          <header className="text-center p-8 border-b border-white/10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 flex items-center justify-center gap-3">
              <Wrench className="text-primary"/>
              Painel de Ferramentas CTO
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Ferramentas essenciais para operações de rede e desenvolvimento.</p>
          </header>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <ToolButton onClick={() => setIndaiaModalOpen(true)} icon={<Network size={32} />} title="Sistema IndaiaFibra" primary />
              <ToolButton href="https://test-ipv6.com/" icon={<Server size={32} />} title="Teste IPv6" />
              <ToolButton href="https://check-host.net/" icon={<Search size={32} />} title="Host Check" />
              <ToolButton href={hostUrl} icon={<Router size={32} />} title={hostText} />
              <ToolButton href="https://bgp.he.net/" icon={<Spline size={32} />} title="BGP Toolkit" />
              <ToolButton onClick={handleOpenSpeedtest} icon={<Gauge size={32} />} title="Speed Test" />
              <ToolButton onClick={() => setQrModalOpen(true)} icon={<QrCode size={32} />} title="QR Code" />
              <ToolButton href="https://forms.gle/UEqhzzLM3TGXgTbE6" icon={<PackagePlus size={32} />} title="Pedido de Material" />

              {/* Map Section */}
              <div className="col-span-2 sm:col-span-3 md:col-span-4 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Map size={24} className="text-secondary" />
                  <h3 className="font-medium">Mapas CTO</h3>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <MapIconButton href="https://www.google.com/maps/d/u/0/edit?hl=pt-BR&mid=1l_ch6qupuXz0Dnw6h9Vhom1Y1g3ibaY&ll=-23.104603351905947%2C-47.26240628194967&z=13" title="Editar Mapa" icon={<FilePenLine />} />
                  <MapIconButton href="https://goo.gl/maps/88VJ2ZpSiy4F2Qas7?g_st=aw" title="Abrir Mapa" icon={<MapPin />} />
                  <MapIconButton href="https://earth.app.goo.gl/?apn=com.google.earth&isi=293622097&ius=googleearth&link=https%3a%2f%2fearth.google.com%2fweb%2f%40-23.05937339,-47.31164855,637.82978119a,3835.30342676d,30.00033061y,0h,0t,0r%2fdata%3dMigKJgokCiAxbF9jaDZxdXB1WHowRG53Nmg5VmhvbTFZMWczaWJhWSAC" title="Mapa Earth" icon={<Globe />} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <Dialog open={indaiaModalOpen} onOpenChange={setIndaiaModalOpen}>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent className="w-[95vw] max-w-5xl h-[90vh] bg-card/80 backdrop-blur-xl border-white/10 p-2 flex flex-col animate-zoom-in">
          <iframe className="w-full h-full border-none rounded-md flex-grow" src="https://gchat.indaiafibra.com.br/#/login" title="Sistema IndaiaFibra"></iframe>
          <Button asChild className="mt-2 w-full">
            <a href="https://gchat.indaiafibra.com.br/#/login" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Abrir Externamente
            </a>
          </Button>
          <DialogClose className="absolute top-2 right-2 !text-muted-foreground hover:!text-foreground">
             <X/>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      <Dialog open={speedtestModalOpen} onOpenChange={setSpeedtestModalOpen}>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent className="w-[95vw] max-w-5xl h-[90vh] bg-card/80 backdrop-blur-xl border-white/10 p-2 flex flex-col animate-zoom-in">
            <div className="text-center p-3 bg-black/20 rounded-md mb-2 text-xs border border-white/10">
              {ipInfoLoading ? (
                <p className="text-accent animate-pulse">Carregando informações de rede...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <p><strong className="text-primary">IPv4:</strong> {ipInfo.ipv4}</p>
                  <p><strong className="text-primary">IPv6:</strong> {ipInfo.ipv6}</p>
                  <p><strong className="text-primary">Local:</strong> {ipInfo.location}</p>
                </div>
              )}
            </div>
            <iframe className="w-full h-full border-none rounded-md flex-grow" src="https://fast.com/" title="Speed Test"></iframe>
            <Button asChild variant="secondary" className="mt-2 w-full">
                <a href="https://www.speedtest.net/pt" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Abrir no OOKLA
                </a>
            </Button>
            <DialogClose className="absolute top-2 right-2 !text-muted-foreground hover:!text-foreground">
                <X/>
            </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent className="p-0 bg-transparent border-none shadow-none w-auto animate-zoom-in flex items-center justify-center">
            {qrCodeImage && <Image src={qrCodeImage.imageUrl} alt="QR Code" width={400} height={400} className="max-w-full h-auto rounded-lg border-4 border-white shadow-2xl shadow-primary/50" />}
             <DialogClose className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 !text-background bg-foreground rounded-full p-1">
                <X/>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
