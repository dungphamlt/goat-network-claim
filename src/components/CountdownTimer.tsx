import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string | number; // Unix timestamp (seconds)
}

function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const target = Number(targetDate) * 1000; // Convert to milliseconds
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return;
  }

  return (
    <div className="flex items-center text-black text-md">
      <span className="">(</span>
      <div className="flex items-center justify-center gap-2 w-[200px]">
        {timeLeft.days > 0 && (
          <span className="">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
            {timeLeft.seconds}s
          </span>
        )}
        {timeLeft.days === 0 && timeLeft.hours > 0 && (
          <span className="">
            {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
        {timeLeft.days === 0 &&
          timeLeft.hours === 0 &&
          timeLeft.minutes > 0 && (
            <span className="">
              {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          )}
        {timeLeft.days === 0 &&
          timeLeft.hours === 0 &&
          timeLeft.minutes === 0 && (
            <span className="">{timeLeft.seconds}s</span>
          )}
      </div>
      <span className="">)</span>
    </div>
  );
}

export default CountdownTimer;
