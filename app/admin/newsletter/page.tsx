'use client';

import { useEffect, useState } from 'react';

interface NewsletterSubscriber {
  id: string;
  created_at: string;
  email: string;
  first_name?: string;
  last_name?: string;
  has_disability?: boolean;
  interests?: string[];
  status: 'pending' | 'confirmed';
  opt_in_confirmed_at?: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/newsletter', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diesen Abonnenten wirklich löschen?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id));
        if (selectedSubscriber?.id === id) {
          setSelectedSubscriber(null);
        }
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Fehler beim Löschen');
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Newsletter Abonnenten</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-brand-pink text-black' : 'bg-gray-700'}`}
          >
            Alle ({subscribers.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded ${filter === 'confirmed' ? 'bg-brand-pink text-black' : 'bg-gray-700'}`}
          >
            Bestätigt ({subscribers.filter(s => s.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-brand-pink text-black' : 'bg-gray-700'}`}
          >
            Ausstehend ({subscribers.filter(s => s.status === 'pending').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Abonnenten ({filteredSubscribers.length})
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                onClick={() => setSelectedSubscriber(subscriber)}
                className={`p-4 rounded cursor-pointer border ${
                  selectedSubscriber?.id === subscriber.id
                    ? 'border-brand-pink bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{subscriber.email}</p>
                    {(subscriber.first_name || subscriber.last_name) && (
                      <p className="text-sm text-gray-400">
                        {subscriber.first_name} {subscriber.last_name}
                      </p>
                    )}
                    <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                      subscriber.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {subscriber.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(subscriber.created_at).toLocaleDateString('de-CH')}
                  </span>
                </div>
              </div>
            ))}
            {filteredSubscribers.length === 0 && (
              <p className="text-gray-400 text-center py-8">Keine Abonnenten vorhanden</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {selectedSubscriber ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Details</h2>
                <button
                  onClick={() => handleDelete(selectedSubscriber.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Löschen
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">E-Mail</p>
                  <p className="font-semibold">{selectedSubscriber.email}</p>
                </div>
                {selectedSubscriber.first_name && (
                  <div>
                    <p className="text-sm text-gray-400">Vorname</p>
                    <p>{selectedSubscriber.first_name}</p>
                  </div>
                )}
                {selectedSubscriber.last_name && (
                  <div>
                    <p className="text-sm text-gray-400">Nachname</p>
                    <p>{selectedSubscriber.last_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedSubscriber.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedSubscriber.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                  </span>
                </div>
                {selectedSubscriber.has_disability !== undefined && (
                  <div>
                    <p className="text-sm text-gray-400">Beeinträchtigung</p>
                    <p>{selectedSubscriber.has_disability ? 'Ja' : 'Nein'}</p>
                  </div>
                )}
                {selectedSubscriber.interests && selectedSubscriber.interests.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Interessen</p>
                    <p>{selectedSubscriber.interests.join(', ')}</p>
                  </div>
                )}
                {selectedSubscriber.opt_in_confirmed_at && (
                  <div>
                    <p className="text-sm text-gray-400">Bestätigt am</p>
                    <p>{new Date(selectedSubscriber.opt_in_confirmed_at).toLocaleString('de-CH')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Erstellt am</p>
                  <p>{new Date(selectedSubscriber.created_at).toLocaleString('de-CH')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Wähle einen Abonnenten aus, um Details zu sehen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

