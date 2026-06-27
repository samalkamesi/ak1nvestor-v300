import { BookOpen, GraduationCap, Award, TrendingUp, Layers, Zap } from 'lucide-react';
import { useState } from 'react';

export function Larande() {
  const [activeCourse, setActiveCourse] = useState<number | null>(null);

  const courses = [
    { title: 'Aktiemarknadens Grunder', level: 'Nybörjare', progress: 75, icon: BookOpen, color: '#4ade80', modules: ['Vad är aktier?', 'Börser och index', 'Order typer', 'Courtage och skatt'] },
    { title: 'Teknisk Analys', level: 'Medelavancerad', progress: 45, icon: TrendingUp, color: '#60a5fa', modules: ['Stöd och motstånd', 'Moving averages', 'RSI och MACD', 'Candlestick-mönster'] },
    { title: 'Fundamental Analys', level: 'Medelavancerad', progress: 20, icon: Layers, color: '#f472b6', modules: ['Kassaflödesanalys', 'Värderingsmultiplar', 'Sektoranalys', 'Rapporter och guidance'] },
    { title: 'Avancerade Strategier', level: 'Avancerad', progress: 0, icon: Zap, color: '#d4af37', modules: ['Optionsstrategier', 'Riskhantering', 'Portföljoptimering', 'Algoritmisk handel'] },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#d4af37', marginBottom: 20 }}>
        <GraduationCap size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Lärande
      </h1>
      <div style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center' }}>
        <Award size={28} color="#d4af37" style={{ margin: '0 auto 8px' }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Utbildning → Inkomst</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Genomför kurser för att låsa upp avancerade analysverktyg</div>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {courses.map((course, i) => {
          const Icon = course.icon;
          return (
            <div key={i} onClick={() => setActiveCourse(activeCourse === i ? null : i)}
              style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${course.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={course.color} />
                </div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: '#e2e8f0' }}>{course.title}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{course.level}</div></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: course.color }}>{course.progress}%</div>
              </div>
              <div style={{ height: 6, background: '#0f1425', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${course.progress}%`, background: course.color, borderRadius: 3, transition: 'width 0.3s ease' }} />
              </div>
              {activeCourse === i && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a3050' }}>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Moduler:</div>
                  {course.modules.map((mod, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, color: '#e2e8f0' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: j < course.progress / 25 ? '#4ade80' : '#2a3050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: j < course.progress / 25 ? '#0a0e17' : '#94a3b8' }}>{j < course.progress / 25 ? '✓' : String(j + 1)}</div>{mod}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
