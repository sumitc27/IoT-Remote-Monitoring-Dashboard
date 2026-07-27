import ReactECharts from 'echarts-for-react';

export const ChargeGauge = ({ value = 0, label = 'Battery' }) => {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#b2bec3' : '#6b7c8a';

  let color = '#27ae60'; // Green
  if (value < 20) color = '#e74c3c'; // Red
  else if (value < 40) color = '#f39c12'; // Amber

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: color,
            color: color
          }
        },
        axisLine: {
          lineStyle: { width: 10, color: [[1, isDarkMode ? '#333' : '#eee']] }
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [{
          value: value,
          name: label,
          title: { offsetCenter: ['0%', '30%'], fontSize: 12, color: textColor },
          detail: { offsetCenter: ['0%', '-10%'], valueAnimation: true, fontSize: 20, color: 'inherit', formatter: '{value}%' }
        }],
        title: { fontSize: 12 },
        detail: { width: 50, height: 14, fontSize: 18, color: 'auto', formatter: '{value}%' }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '120px', width: '100%' }} />;
};
