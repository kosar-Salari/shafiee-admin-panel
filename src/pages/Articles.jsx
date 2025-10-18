const Articles = () => {
  const chartData = [60, 80, 45, 90, 70, 85, 95];
  
  const stats = [
    { label: 'بازدید امروز', value: '۲,۳۴۵', percentage: 75, color: 'blue' },
    { label: 'بازدید هفته', value: '۱۵,۶۷۸', percentage: 60, color: 'green' },
    { label: 'بازدید ماه', value: '۶۵,۴۳۲', percentage: 90, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">آمار و گزارش</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">نمودار فروش</h2>
          <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-lg flex items-end justify-around p-4">
            {chartData.map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="w-12 bg-blue-500 rounded-t" 
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500">روز {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">آمار بازدید</h2>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{stat.label}</span>
                  <span className="font-bold text-gray-800">{stat.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${stat.color}-500 h-2 rounded-full`}
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles;