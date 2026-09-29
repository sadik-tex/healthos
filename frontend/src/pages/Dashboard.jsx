import { Link } from 'react-router-dom';
import { Activity, Droplets, Moon, Scale, Smile } from 'lucide-react';
import { dashboardApi } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage, Skeleton } from '../components/ui.jsx';

function StatCard({ icon: Icon, label, value, unit }) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-teal-700" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>

      <p className="text-2xl font-bold">
        {value ?? '—'}
        {value != null && unit && (
          <span className="ml-1 text-sm font-medium text-slate-500">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, retry } = useFetch(dashboardApi.get);

  const hour = new Date().getHours();
  const greet =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

  const name = user?.full_name || user?.name || '';

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">
            {greet}{name && `, ${name}`}
          </h2>
          <p className="text-slate-600">
            Here's your latest health overview.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retry} />;
  }

  if (!data) {
    return null;
  }

  const today = data.today || {};
  const last7 = data.last_7_days || {};

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">
          {greet}{name && `, ${name}`}
        </h2>
        <p className="text-slate-600">
          Here's your latest health overview.
        </p>
      </div>

      {/* Today's overview */}
      <section>
        <h3 className="mb-3 text-lg font-semibold">
          Today's overview
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Droplets}
            label="Water"
            value={today.water_ml}
            unit="ml"
          />

          <StatCard
            icon={Activity}
            label="Steps"
            value={today.steps}
          />

          <StatCard
            icon={Activity}
            label="Exercise"
            value={today.exercise_minutes}
            unit="min"
          />

          <StatCard
            icon={Moon}
            label="Sleep"
            value={
              today.sleep_minutes != null
                ? Math.round(today.sleep_minutes / 60 * 10) / 10
                : null
            }
            unit="hrs"
          />

          <StatCard
            icon={Scale}
            label="Weight"
            value={today.weight_kg}
            unit="kg"
          />

          <StatCard
            icon={Smile}
            label="Mood"
            value={today.mood_score}
            unit="/ 5"
          />
        </div>
      </section>

      {/* Last 7 days */}
      <section>
        <h3 className="mb-3 text-lg font-semibold">
          Last 7 days
        </h3>

        <div className="card">
          <h4 className="mb-4 font-semibold">Water intake</h4>

          {last7.water?.length ? (
            <div className="space-y-3">
              {last7.water.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
                >
                  <span className="text-sm text-slate-600">
                    {entry.date}
                  </span>

                  <span className="font-semibold">
                    {entry.amount_ml ?? entry.water_ml ?? 0} ml
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No water data recorded yet.
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="card">
          <h4 className="mb-4 font-semibold">Activity</h4>

          {last7.activity?.length ? (
            <div className="space-y-3">
              {last7.activity.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
                >
                  <span className="text-sm text-slate-600">
                    {entry.date}
                  </span>

                  <span className="font-semibold">
                    {entry.steps ?? 0} steps
                    {entry.exercise_minutes != null &&
                      ` · ${entry.exercise_minutes} min exercise`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No activity data recorded yet.
            </p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="mb-3 text-lg font-semibold">
          Quick actions
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/health"
            className="card p-4 font-semibold hover:border-teal-600"
          >
            Log health data
          </Link>

          <Link
            to="/mood"
            className="card p-4 font-semibold hover:border-teal-600"
          >
            Log mood
          </Link>

          <Link
            to="/health"
            className="card p-4 font-semibold hover:border-teal-600"
          >
            View health
          </Link>

          <Link
            to="/profile"
            className="card p-4 font-semibold hover:border-teal-600"
          >
            Profile
          </Link>
        </div>
      </section>
    </div>
  );
}