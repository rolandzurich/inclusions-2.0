'use client';

import { useEffect, useState } from 'react';

interface ContactRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  booking_type?: string;
  booking_item?: string;
  event_date?: string;
  event_location?: string;
  event_type?: string;
  status: string;
  viewed_at?: string;
  is_duplicate?: boolean;
}

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/contact-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = async (request: ContactRequest) => {
    setSelectedRequest(request);
    
    // Mark as viewed if not already viewed
    if (!request.viewed_at) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        await fetch(`/api/admin/contact-requests/${request.id}`, {
          method: 'GET', // GET automatically marks as viewed
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Update local state
        setRequests(requests.map(r => 
          r.id === request.id ? { ...r, viewed_at: new Date().toISOString() } : r
        ));
      } catch (error) {
        console.error('Error marking as viewed:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diese Anfrage wirklich löschen?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch(`/api/admin/contact-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRequests(requests.filter(r => r.id !== id));
        if (selectedRequest?.id === id) {
          setSelectedRequest(null);
        }
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Fehler beim Löschen');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Booking-Anfragen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Alle Booking-Anfragen ({requests.length})</h2>
            <div className="text-sm text-gray-400">
              Neu: {requests.filter(r => !r.viewed_at).length}
            </div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {requests.map((request) => (
              <div
                key={request.id}
                onClick={() => handleSelectRequest(request)}
                className={`p-4 rounded cursor-pointer border ${
                  selectedRequest?.id === request.id
                    ? 'border-brand-pink bg-gray-700'
                    : !request.viewed_at
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{request.name}</p>
                      {request.is_duplicate && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                          Doppelt
                        </span>
                      )}
                      {!request.viewed_at && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          Neu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{request.email}</p>
                    {request.booking_item && (
                      <p className="text-xs text-gray-500 mt-1">{request.booking_item}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleDateString('de-CH')}
                  </span>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-gray-400 text-center py-8">Keine Booking-Anfragen vorhanden</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {selectedRequest ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Details</h2>
                <button
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Löschen
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-semibold">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">E-Mail</p>
                  <p>{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Telefon</p>
                  {selectedRequest.phone ? (
                    <p>{selectedRequest.phone}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nicht angegeben</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Booking-Typ</p>
                  {selectedRequest.booking_type ? (
                    <p>{selectedRequest.booking_type}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nicht angegeben</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gebuchtes Item</p>
                  {selectedRequest.booking_item ? (
                    <p>{selectedRequest.booking_item}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nicht angegeben</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Event-Datum</p>
                  {selectedRequest.event_date ? (
                    <p>{selectedRequest.event_date}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nicht angegeben</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Event-Ort</p>
                  {selectedRequest.event_location ? (
                    <p>{selectedRequest.event_location}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nicht angegeben</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Art des Events</p>
                  {selectedRequest.event_type ? (
                    <p>{selectedRequest.event_type}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nicht angegeben</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Nachricht</p>
                  {selectedRequest.message ? (
                    <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
                  ) : (
                    <p className="text-gray-500 italic">Keine Nachricht</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="font-semibold">{selectedRequest.status || 'new'}</p>
                </div>
                {selectedRequest.is_duplicate && (
                  <div>
                    <p className="text-sm text-gray-400">Hinweis</p>
                    <p className="text-yellow-400 font-semibold">⚠️ Doppelte E-Mail-Adresse</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Erstellt am</p>
                  <p>{new Date(selectedRequest.created_at).toLocaleString('de-CH')}</p>
                </div>
                {selectedRequest.viewed_at && (
                  <div>
                    <p className="text-sm text-gray-400">Angeschaut am</p>
                    <p>{new Date(selectedRequest.viewed_at).toLocaleString('de-CH')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Wähle eine Anfrage aus, um Details zu sehen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

