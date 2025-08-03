// TYPES

export interface Ticket {
  id: number;
  eventName: string;
  location: string;
  time: string;
  isUsed: boolean;
}

export interface Stats {
  total: number;
  used: number;
  valid: number;
}

export type ViewMode = 'card' | 'table';
export type FilterMode = 'all' | 'used' | 'valid';

// CONSTANTS

export const APP_CONFIG = {
  title: 'Event Tickets Manager',
  subtitle: 'Manage your event tickets with ease',
};

// UTILS

export const DateUtils = {
  formatTime: (isoString: string): string => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  },
};

export const TicketService = {
  generateTickets: (): Ticket[] => [
    {
      id: 1,
      eventName: 'DWP 2025',
      location: 'Jakarta',
      time: new Date().toISOString(),
      isUsed: false,
    },
    {
      id: 2,
      eventName: 'Theater B',
      location: 'Hall Y',
      time: new Date().toISOString(),
      isUsed: true,
    },
    {
      id: 3,
      eventName: 'Conference C',
      location: 'Center Z',
      time: new Date().toISOString(),
      isUsed: false,
    },
  ],

  calculateStats: (tickets: Ticket[]): Stats => {
    const total = tickets.length;
    const used = tickets.filter((t) => t.isUsed).length;
    const valid = total - used;
    return { total, used, valid };
  },
};

export const StyleUtils = {
  getTicketColor: (isUsed: boolean): string =>
    isUsed ? 'bg-gray-200' : 'bg-white',
};

// HOOK

import { useState, useMemo } from 'react';

export const useTicketManager = () => {
  const [tickets, setTickets] = useState<Ticket[]>(
    TicketService.generateTickets()
  );
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const stats = useMemo(() => TicketService.calculateStats(tickets), [tickets]);

  const filteredTickets = useMemo(() => {
    switch (filter) {
      case 'valid':
        return tickets.filter((t) => !t.isUsed);
      case 'used':
        return tickets.filter((t) => t.isUsed);
      default:
        return tickets;
    }
  }, [tickets, filter]);

  const handleToggleTicket = (id: number) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, isUsed: !ticket.isUsed } : ticket
      )
    );
  };

  const resetAll = () => {
    setFilter('all');
    setViewMode('card');
  };

  return {
    tickets,
    stats,
    filter,
    viewMode,
    setFilter,
    setViewMode,
    resetAll,
    filteredTickets,
    handleToggleTicket,
  };
};

// COMPONENTS (INLINE)

import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Filter,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';

const StatsSection: React.FC<{ stats: Stats }> = ({ stats }) => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
    <StatCard label="Total Tickets" value={stats.total} icon={<Calendar />} />
    <StatCard label="Valid Tickets" value={stats.valid} icon={<Check />} valueClass="text-green-600" />
    <StatCard label="Used Tickets" value={stats.used} icon={<X />} />
  </section>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  valueClass?: string;
}> = ({ label, value, icon, valueClass = 'text-gray-800' }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl shadow bg-white">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className={`text-2xl font-bold ${valueClass}`}>{value}</h3>
    </div>
    <div className="text-blue-500 bg-blue-100 p-2 rounded-xl">{icon}</div>
  </div>
);

const ControlsSection: React.FC<{
  filter: FilterMode;
  setFilter: (f: FilterMode) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  resetAll: () => void;
  stats: Stats;
}> = ({ filter, setFilter, viewMode, setViewMode, resetAll, stats }) => (
  <section className="flex flex-wrap items-center gap-2 text-sm">
    <div className="flex items-center gap-1 text-gray-500">
      <Filter size={16} /> Filter:
    </div>
    {(['all', '', 'used'] as FilterMode[]).map((mode) => (
      <button
        key={mode}
        onClick={() => setFilter(mode)}
        className={`px-3 py-1 rounded-full border ${
          filter === mode ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100'
        }`}
      >
        {mode === 'all' && `All Tickets (${stats.total})`}
        {mode === 'valid' && `Valid (${stats.valid})`}
        {mode === 'used' && `Used (${stats.used})`}
      </button>
    ))}
    <div className="flex items-center gap-1 ml-4">
      <button
        onClick={() => setViewMode('card')}
        className={`px-3 py-1 rounded-full ${
          viewMode === 'card' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        Cards
      </button>
      <button
        onClick={() => setViewMode('table')}
        className={`px-3 py-1 rounded-full ${
          viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        Table
      </button>
    </div>
    <button
      onClick={resetAll}
      className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600"
    >
      <RotateCcw size={16} /> Reset All
    </button>
  </section>
);

const EmptyState: React.FC = () => (
  <div className="p-10 text-center text-gray-400">No tickets found for this filter.</div>
);

const TicketCard: React.FC<{
  ticket: Ticket;
  onToggle: (id: number) => void;
}> = ({ ticket, onToggle }) => (
  <div
    className={`rounded-2xl p-4 shadow transition ${
      ticket.isUsed ? 'bg-gray-100' : 'bg-white'
    }`}
  >
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-lg font-semibold">{ticket.eventName}</h4>
      <button
        onClick={() => onToggle(ticket.id)}
        className={`px-3 py-1 rounded-full ${
          ticket.isUsed ? 'bg-gray-300' : 'bg-green-100 text-green-600'
        }`}
      >
        {ticket.isUsed ? 'Used' : 'Mark as Used'}
      </button>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <MapPin size={14} /> {ticket.location}
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Clock size={14} /> {DateUtils.formatTime(ticket.time)}
    </div>
  </div>
);

const TicketTable: React.FC<{
  tickets: Ticket[];
  onToggle: (id: number) => void;
}> = ({ tickets, onToggle }) => (
  <table className="min-w-full text-left text-sm">
    <thead className="text-gray-500">
      <tr>
        <th className="p-2">Event</th>
        <th className="p-2">Location</th>
        <th className="p-2">Time</th>
        <th className="p-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {tickets.map((ticket) => (
        <tr
          key={ticket.id}
          className={`border-t ${
            ticket.isUsed ? 'bg-gray-100' : 'bg-white'
          }`}
        >
          <td className="p-2 font-medium">{ticket.eventName}</td>
          <td className="p-2">{ticket.location}</td>
          <td className="p-2">{DateUtils.formatTime(ticket.time)}</td>
          <td className="p-2">
            <button
              onClick={() => onToggle(ticket.id)}
              className={`px-2 py-1 rounded-full ${
                ticket.isUsed ? 'bg-gray-300' : 'bg-green-100 text-green-600'
              }`}
            >
              {ticket.isUsed ? 'Used' : 'Valid'}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TicketsDisplay: React.FC<{
  tickets: Ticket[];
  viewMode: ViewMode;
  onToggle: (id: number) => void;
}> = ({ tickets, viewMode, onToggle }) => {
  if (tickets.length === 0) return <EmptyState />;
  return viewMode === 'card' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} onToggle={onToggle} />
      ))}
    </div>
  ) : (
    <TicketTable tickets={tickets} onToggle={onToggle} />
  );
};

// ROOT COMPONENT

const EventTicketsApp: React.FC = () => {
  const {
    stats,
    filter,
    viewMode,
    setFilter,
    setViewMode,
    resetAll,
    filteredTickets,
    handleToggleTicket,
  } = useTicketManager();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="text-center py-4">
        <h1 className="text-3xl font-bold text-purple-600">
          {APP_CONFIG.title}
        </h1>
        <p className="text-gray-500">{APP_CONFIG.subtitle}</p>
      </header>

      <StatsSection stats={stats} />

      <ControlsSection
        filter={filter}
        setFilter={setFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        resetAll={resetAll}
        stats={stats}
      />

      <main className="mt-6">
        <TicketsDisplay
          tickets={filteredTickets}
          viewMode={viewMode}
          onToggle={handleToggleTicket}
        />
      </main>
    </div>
  );
};

export default EventTicketsApp;
