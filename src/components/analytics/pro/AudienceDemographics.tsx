import { useMemo } from "react";
import { Monitor, Smartphone, Tablet, Globe, MapPin } from "lucide-react";

interface AudienceDemographicsProps {
  analytics: any;
}

/**
 * Pro analytics component that displays visitor demographics
 * Shows devices breakdown and geographic distribution
 */
const AudienceDemographics = ({ analytics }: AudienceDemographicsProps) => {
  // Handle device breakdown
  const deviceData = useMemo(() => {
    if (!analytics?.viewsByDevice) return [];

    const { desktop = 0, mobile = 0, tablet = 0, other = 0 } = analytics.viewsByDevice;
    const total = desktop + mobile + tablet + other;
    
    if (total === 0) return [];

    return [
      { 
        name: "Desktop", 
        value: desktop, 
        percentage: ((desktop / total) * 100).toFixed(1),
        icon: <Monitor className="h-4 w-4" />
      },
      { 
        name: "Mobile", 
        value: mobile, 
        percentage: ((mobile / total) * 100).toFixed(1),
        icon: <Smartphone className="h-4 w-4" />
      },
      { 
        name: "Tablet", 
        value: tablet, 
        percentage: ((tablet / total) * 100).toFixed(1),
        icon: <Tablet className="h-4 w-4" />
      },
      { 
        name: "Other", 
        value: other, 
        percentage: ((other / total) * 100).toFixed(1),
        icon: null
      }
    ].filter(item => item.value > 0)
     .sort((a, b) => b.value - a.value);
  }, [analytics]);

  // Handle geographic breakdown
  const geoData = useMemo(() => {
    if (!analytics?.geoBreakdown) return [];

    const entries = Object.entries(analytics.geoBreakdown);
    if (entries.length === 0) return [];

    const total = entries.reduce((sum, [_, count]) => sum + (count as number), 0);
    
    return entries
      .map(([country, count]) => ({
        name: country,
        value: count as number,
        percentage: ((count as number / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 countries
  }, [analytics]);

  if (!analytics) return null;

  return (
    <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Device breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Device Breakdown</h3>
        {deviceData.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg text-center">
            <Monitor className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No device data available</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            {deviceData.map((device) => (
              <div key={device.name} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center text-slate-200">
                    {device.icon && <span className="mr-2 text-blue-400">{device.icon}</span>}
                    {device.name}
                  </div>
                  <span className="text-white font-medium">{device.percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geographic breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Top Locations</h3>
        {geoData.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg text-center">
            <Globe className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No location data available</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            {geoData.map((location) => (
              <div key={location.name} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center text-slate-200">
                    <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                    {location.name}
                  </div>
                  <span className="text-white font-medium">{location.percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AudienceDemographics;
