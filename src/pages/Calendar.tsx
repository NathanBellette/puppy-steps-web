import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SessionItem } from '@/components/ui/SessionItem';
import { useDogs } from '@/hooks/useDogProfile';
import { useSessions } from '@/hooks/useSessions';
import { Session, SessionType, SESSION_TYPE_EMOJI } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target } from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TYPE_DOT_COLORS: Record<SessionType, string> = {
  people: 'bg-indigo-500',
  dogs: 'bg-violet-500',
  environments: 'bg-emerald-500',
  noises: 'bg-amber-500',
};

function getMonthDays(year: number, month: number) {
  // month is 0-indexed (0 = January)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // getDay() returns 0=Sun, we need 0=Mon
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6; // Sunday wraps to 6

  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Fill trailing days to complete the grid (always 6 rows x 7 cols = 42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }

  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export const Calendar = () => {
  const { selectedDog } = useDogs();
  const { sessions, isLoading } = useSessions(selectedDog?.id);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  // Build a map of date-string -> sessions for quick lookup
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const session of sessions) {
      const d = new Date(session.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(session);
    }
    return map;
  }, [sessions]);

  const getSessionsForDate = (date: Date): Session[] => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return sessionsByDay.get(key) || [];
  };

  const getUniqueTypesForDate = (date: Date): SessionType[] => {
    const daySessions = getSessionsForDate(date);
    return [...new Set(daySessions.map(s => s.type))];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const selectedDaySessions = selectedDate ? getSessionsForDate(selectedDate) : [];

  if (!selectedDog) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No Dog Selected
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Please select a dog to view their session calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Calendar
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          View {selectedDog.name}'s socialisation sessions over time
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {monthLabel}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-7 gap-1">
                {[...Array(42)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map(({ date, isCurrentMonth }, idx) => {
                  const types = getUniqueTypesForDate(date);
                  const hasSessions = types.length > 0;
                  const isSelected = selectedDate !== null && isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'relative flex flex-col items-center justify-start p-1 sm:p-2 min-h-[3.5rem] sm:min-h-[4rem] rounded-lg border transition-all text-sm',
                        isCurrentMonth
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400 dark:text-slate-600',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800',
                        isTodayDate && !isSelected && 'border-primary-300 dark:border-primary-700'
                      )}
                    >
                      <span
                        className={cn(
                          'text-xs sm:text-sm font-medium',
                          isTodayDate &&
                            'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        )}
                      >
                        {date.getDate()}
                      </span>

                      {/* Session type dots */}
                      {hasSessions && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {types.map((type) => (
                            <span
                              key={type}
                              className={cn(
                                'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full',
                                TYPE_DOT_COLORS[type]
                              )}
                              title={`${SESSION_TYPE_EMOJI[type]} ${type}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Legend:</span>
                {(Object.entries(TYPE_DOT_COLORS) as [SessionType, string][]).map(
                  ([type, colorClass]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', colorClass)} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                        {SESSION_TYPE_EMOJI[type]} {type}
                      </span>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected day detail */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(selectedDate)}
            </CardTitle>
            <CardDescription>
              {selectedDaySessions.length === 0
                ? 'No sessions on this day'
                : `${selectedDaySessions.length} session${selectedDaySessions.length !== 1 ? 's' : ''} logged`}
            </CardDescription>
          </CardHeader>
          {selectedDaySessions.length > 0 && (
            <CardContent>
              <div className="space-y-3">
                {selectedDaySessions.map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
