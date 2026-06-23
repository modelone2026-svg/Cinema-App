import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, HardDrive, PlayCircle, ExternalLink } from 'lucide-react';
import { MediaItem, AdsConfig } from '../types';

interface VideoPlayerProps {
  item: MediaItem;
  adsConfig: AdsConfig | null;
  onBack: () => void;
}

export default function VideoPlayer({ item, adsConfig, onBack }: VideoPlayerProps) {
  const [activeServerUrl, setActiveServerUrl] = useState<string>(item.iframeUrl);
  const [activeServerName, setActiveServerName] = useState<string>('السيرفر الرئيسي');
  const [popunderTriggered, setPopunderTriggered] = useState<boolean>(false);

  // Set default active server url
  useEffect(() => {
    setActiveServerUrl(item.iframeUrl);
    setActiveServerName('السيرفر الرئيسي');
  }, [item]);

  // Handle first click for Popunder ads
  const handlePlayerContainerClick = () => {
    if (adsConfig?.popunderActive && adsConfig.popunderCode && !popunderTriggered) {
      setPopunderTriggered(true);
      // Execute popunder - usually popunder is opening a link. Let's see if there's an URL in the code or if we can run it.
      // Often advertisers use direct URLs or custom scripts. Let's parse or run it safely, or open a mock or provided url.
      const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
      const urls = adsConfig.popunderCode.match(urlRegex);
      if (urls && urls.length > 0) {
        window.open(urls[0], '_blank');
      } else {
        // If it's a general script, we can run it or open a default promo/partner site
        window.open('https://www.google.com', '_blank');
      }
    }
  };

  // Safe renderer for banner scripts/iframes
  const RenderBanner = ({ code, active }: { code: string; active: boolean }) => {
    if (!active || !code) return null;

    // Check if the script contains a source or plain HTML
    const isScript = code.includes('<script') || code.includes('javascript:');
    
    if (isScript) {
      // For scripts, we can inject a clean frame or set it safely
      return (
        <div 
          className="flex justify-center my-4 p-2 bg-[#13111c] border border-white/5 rounded-xl overflow-hidden max-w-full text-center text-xs text-gray-500"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      );
    }

    return (
      <div className="flex justify-center my-4 p-2 bg-[#13111c] border border-white/5 rounded-xl overflow-hidden max-w-full">
        <div dangerouslySetInnerHTML={{ __html: code }} />
      </div>
    );
  };

  return (
    <div id={`video-player-container-${item.id}`} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right">
      
      {/* Back Button */}
      <button
        id="player-back-btn"
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl mb-6 transition-all text-sm font-semibold select-none cursor-pointer border border-white/5 active:scale-95"
      >
        <ArrowRight size={16} />
        <span>العودة للرئيسية</span>
      </button>

      {/* Ads: Banner Above Player */}
      {adsConfig && (
        <RenderBanner code={adsConfig.bannerAboveCode} active={adsConfig.bannerAboveActive} />
      )}

      {/* Title & Category Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-md mb-2 inline-block">
            {item.type === 'movie' ? 'مشاهدة فيلم' : 'مشاهدة مسلسل'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {item.title}
          </h1>
        </div>
        
        {/* Rating and server indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-yellow-500 bg-[#13111c] border border-white/5 px-3 py-1.5 rounded-xl text-sm font-bold">
            <Star size={14} className="fill-yellow-500" />
            <span>{item.rating}/10</span>
          </div>
          <div className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl">
            السيرفر الحالي: <span className="text-red-500 font-semibold">{activeServerName}</span>
          </div>
        </div>
      </div>

      {/* Main Video Player Sandbox */}
      <div 
        id="player-iframe-wrapper"
        onClick={handlePlayerContainerClick}
        className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl group cursor-pointer mb-6"
      >
        <iframe
          src={activeServerUrl}
          title={item.title}
          className="w-full h-full"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>

      {/* Watch Servers Choice Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
          <HardDrive size={16} className="text-red-500" />
          <span>اختر سيرفر المشاهدة البديل:</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Main default server button */}
          <button
            id="server-main-btn"
            onClick={() => {
              setActiveServerUrl(item.iframeUrl);
              setActiveServerName('السيرفر الرئيسي');
            }}
            className={`px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border ${
              activeServerUrl === item.iframeUrl
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/10'
                : 'bg-[#13111c] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlayCircle size={14} />
            <span>السيرفر الرئيسي</span>
          </button>

          {/* Alternate servers list */}
          {item.alternativeServers && item.alternativeServers.map((server, idx) => (
            <button
              id={`server-alt-btn-${idx}`}
              key={idx}
              onClick={() => {
                setActiveServerUrl(server.url);
                setActiveServerName(server.name || `سيرفر بديل ${idx + 1}`);
              }}
              className={`px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border ${
                activeServerUrl === server.url
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/10'
                  : 'bg-[#13111c] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ExternalLink size={14} />
              <span>{server.name || `سيرفر بديل ${idx + 1}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description Sync */}
      <div className="bg-[#13111c] border border-white/5 p-6 rounded-2xl mb-6">
        <h4 className="text-base font-bold text-white mb-3">قصة وتفاصيل العرض</h4>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
          {item.description}
        </p>
      </div>

      {/* Ads: Banner Below Player */}
      {adsConfig && (
        <RenderBanner code={adsConfig.bannerBelowCode} active={adsConfig.bannerBelowActive} />
      )}

    </div>
  );
}
