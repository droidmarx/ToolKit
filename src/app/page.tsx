"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogClose } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function Home() {
  const [indaiaModalOpen, setIndaiaModalOpen] = useState(false);
  const [speedtestModalOpen, setSpeedtestModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [hostUrl, setHostUrl] = useState('#');
  const [hostText, setHostText] = useState('Gerenciando Host...');
  const [ipInfo, setIpInfo] = useState({ ipv4: '', ipv6: '', location: '' });
  const [ipInfoLoading, setIpInfoLoading] = useState(false);

  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');

  useEffect(() => {
    async function getLocalIP() {
      return new Promise((resolve) => {
        try {
          const conn = new RTCPeerConnection({ iceServers: [] });
          conn.createDataChannel('');
          conn.createOffer()
            .then(offer => conn.setLocalDescription(offer))
            .catch(() => resolve(null));
          let timeout = setTimeout(() => {
            conn.close();
            resolve(null);
          }, 2000);

          conn.onicecandidate = (ice) => {
            if (ice && ice.candidate && ice.candidate.candidate) {
              const candidate = ice.candidate.candidate;
              const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
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
        } catch (error) {
          resolve(null);
        }
      });
    }

    async function setupHostButton() {
      const localIP: string | null = await getLocalIP() as string | null;
      if (localIP) {
        const parts = localIP.split('.');
        const gateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
        setHostUrl(`http://${gateway}/`);
        setHostText(`(${gateway}) Roteador`);
      } else {
        setHostUrl('https://www.noip.com/pt-BR');
        setHostText('Gerenciar Host (Fallback)');
      }
    }

    setupHostButton();
  }, []);

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
        console.log('IPv6 not available');
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

  const buttonClasses = "block w-[90%] p-7 rounded-2xl text-lg font-medium transition-all duration-400 shadow-[0_8px_25px_var(--shadow-medium)] relative overflow-hidden text-white no-underline text-center hover:-translate-y-1 hover:scale-105";

  return (
    <div className="bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] p-5 text-[#111827] font-['Poppins'] leading-relaxed min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_20px_60px_var(--shadow-light)] overflow-hidden animate-slide-up">
        <header className="grainy-header bg-[linear-gradient(135deg,#6366F1,#8B5CF6)] text-white text-center p-10 relative overflow-hidden">
          <h1 className="m-0 text-5xl font-bold [text-shadow:0_4px_12px_rgba(0,0,0,0.2)] tracking-tighter relative z-10">
            <i className="fas fa-tools mr-2"></i> Painel de Ferramentas CTO
          </h1>
        </header>

        <main className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 place-items-center">
            <button onClick={() => setIndaiaModalOpen(true)} className={`${buttonClasses} bg-primary`}>
              <i className="fas fa-network-wired mr-2"></i> Sistema IndaiaFibra
            </button>

            <a href="https://test-ipv6.com/" target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-accent`}>
              <i className="fas fa-server mr-2"></i> Teste IPv6
            </a>

            <a href="https://check-host.net/" target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-primary`}>
              <i className="fas fa-search mr-2"></i> Host Check
            </a>

            <a href={hostUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-accent`}>
              <i className="fas fa-desktop mr-2"></i> {hostText}
            </a>
            
            <a href="https://bgp.he.net/" target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-accent`}>
                <i className="fas fa-route mr-2"></i> BGP Toolkit
            </a>

            <div className={`${buttonClasses} bg-secondary text-center text-xl p-5`}>
              <i className="fas fa-map-marked-alt mr-2"></i> Mapas CTO
              <div className="flex items-center justify-center gap-3 p-4 flex-wrap mt-4">
                <a href="https://www.google.com/maps/d/u/0/edit?hl=pt-BR&mid=1l_ch6qupuXz0Dnw6h9Vhom1Y1g3ibaY&ll=-23.104603351905947%2C-47.26240628194967&z=13" target="_blank" rel="noopener noreferrer" title="Editar Mapa de CTO" className="map-icon">
                  <i className="fas fa-edit"></i>
                </a>
                <a href="https://goo.gl/maps/88VJ2ZpSiy4F2Qas7?g_st=aw" target="_blank" rel="noopener noreferrer" title="Abrir Mapa de CTO" className="map-icon">
                  <i className="fas fa-map"></i>
                </a>
                <a href="https://earth.app.goo.gl/?apn=com.google.earth&isi=293622097&ius=googleearth&link=https%3a%2f%2fearth.google.com%2fweb%2f%40-23.05937339,-47.31164855,637.82978119a,3835.30342676d,30.00033061y,0h,0t,0r%2fdata%3dMigKJgokCiAxbF9jaDZxdXB1WHowRG53Nmg5VmhvbTFZMWczaWJhWSAC" target="_blank" rel="noopener noreferrer" title="Mapa de CTO Earth" className="map-icon">
                  <i className="fas fa-globe"></i>
                </a>
              </div>
            </div>

            <button onClick={handleOpenSpeedtest} className={`${buttonClasses} bg-primary`}>
              <i className="fas fa-tachometer-alt mr-2"></i> Speed Teste
            </button>

            <button onClick={() => setQrModalOpen(true)} className={`${buttonClasses} bg-secondary`}>
              <i className="fas fa-qrcode mr-2"></i> QR Code
            </button>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .grainy-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cdefs%3e%3cpattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'%3e%3ccircle cx='25' cy='25' r='1' fill='white' opacity='0.05'/%3e%3ccircle cx='75' cy='75' r='1' fill='white' opacity='0.05'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grain)'/%3e%3c/svg%3e");
            opacity: 0.3;
            animation: sparkle 3s linear infinite;
        }
        .map-icon {
            width: 65px;
            height: 65px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6em;
            color: hsl(var(--primary));
            transition: all 0.4s ease;
            cursor: pointer;
            box-shadow: 0 6px 20px var(--shadow-light);
            position: relative;
            animation: pulse 2s infinite;
        }
        .map-icon:hover {
            transform: scale(1.15) rotate(10deg);
            box-shadow: 0 10px 30px var(--shadow-medium);
            color: hsl(var(--secondary));
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 6px 20px var(--shadow-light); }
            50% { transform: scale(1.05); box-shadow: 0 8px 25px var(--shadow-medium); }
        }
        .animate-slide-up {
            animation: slideUp 1s ease-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-sparkle {
          animation: sparkle 3s linear infinite;
        }
        @keyframes sparkle {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
      
      <Dialog open={indaiaModalOpen} onOpenChange={setIndaiaModalOpen}>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogContent className="max-w-3xl h-5/6 p-2 sm:p-4 animate-zoom-in">
            <iframe className="w-full h-full border-none rounded-lg" src="https://gchat.indaiafibra.com.br/#/login" title="Sistema IndaiaFibra"></iframe>
            <a href="https://gchat.indaiafibra.com.br/#/login" target="_blank" rel="noopener noreferrer" className="block w-full mt-3 p-3 bg-primary text-primary-foreground text-center rounded-lg text-lg font-medium transition-transform hover:-translate-y-0.5">
                <i className="fas fa-external-link-alt mr-2"></i> Abrir Externamente
            </a>
            <DialogClose asChild>
                <button className="absolute top-4 right-4 text-white text-4xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] hover:text-primary transition-colors">&times;</button>
            </DialogClose>
        </DialogContent>
      </Dialog>
      
      <Dialog open={speedtestModalOpen} onOpenChange={setSpeedtestModalOpen}>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogContent className="max-w-3xl h-5/6 p-2 sm:p-4 animate-zoom-in bg-white">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-4 text-sm border border-blue-200 shadow-sm">
              {ipInfoLoading ? (
                <p className="text-accent"><strong>Carregando informações de rede...</strong></p>
              ) : (
                <>
                  <p><strong>IP Público (IPv4):</strong> {ipInfo.ipv4}</p>
                  <p><strong>IP Público (IPv6):</strong> {ipInfo.ipv6}</p>
                  <p><strong>Localização:</strong> {ipInfo.location}</p>
                </>
              )}
            </div>
            <iframe className="w-full h-full border-none rounded-lg" src="https://fast.com/" title="Speed Test"></iframe>
            <a href="https://www.speedtest.net/pt" target="_blank" rel="noopener noreferrer" className="block w-full mt-3 p-3 bg-secondary text-secondary-foreground text-center rounded-lg text-lg font-medium transition-transform hover:-translate-y-0.5">
                <i className="fas fa-external-link-alt mr-2"></i> Abrir no OOKLA
            </a>
            <DialogClose asChild>
                 <button className="absolute top-4 right-4 text-gray-400 text-4xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] hover:text-primary transition-colors">&times;</button>
            </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogContent className="p-0 bg-transparent border-none shadow-none w-auto animate-zoom-in flex items-center justify-center">
            {qrCodeImage && <Image src={qrCodeImage.imageUrl} alt="QR Code" width={400} height={400} className="max-w-full h-auto rounded-lg" />}
             <DialogClose asChild>
                <button className="absolute top-[-1rem] right-[-1rem] text-white text-4xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] hover:text-primary transition-colors">&times;</button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
