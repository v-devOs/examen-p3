interface ScheduleStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

export default function ScheduleStatsCard({
  title,
  value,
  icon,
  gradient,
  textColor,
}: ScheduleStatsCardProps) {
  return (
    <div className={`${gradient} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium`}>{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}
