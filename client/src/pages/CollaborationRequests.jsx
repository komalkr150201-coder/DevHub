import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAuth,
  findDeveloperByUsername
} from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Tabs } from '../components/Tabs';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

const STATUS_TONES = {
  pending: 'amber',
  accepted: 'green',
  rejected: 'red'
};

export function CollaborationRequests() {
  const { requests, respondToRequest, cancelRequest } = useAuth();
  const navigate = useNavigate();

  const [directionTab, setDirectionTab] = useState('received');
  const [statusFilter, setStatusFilter] = useState('all');

  const receivedRequests = requests.filter((r) => r.direction === 'received');
  const sentRequests = requests.filter((r) => r.direction === 'sent');

  const activeList = directionTab === 'received' ? receivedRequests : sentRequests;
  const filteredList = activeList.filter(
    (r) => statusFilter === 'all' || r.status === statusFilter
  );

  return (
    <>
      <PageHeader
        title="Collaboration Requests"
        text="Review requests you received and track the ones you sent."
        actions={
          <Button
            icon="users"
            onClick={() => navigate('/app/developers')}
          >
            Find developers
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        value={directionTab}
        onChange={setDirectionTab}
        tabs={[
          {
            value: 'received',
            label: 'Received',
            count: receivedRequests.filter((r) => r.status === 'pending').length
          },
          {
            value: 'sent',
            label: 'Sent',
            count: sentRequests.length
          }
        ]}
      />

      {/* Status Filter Chips */}
      <div className="chips">
        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            type="button"
            className={`skill-chip ${statusFilter === status ? 'active' : ''}`}
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon="mail"
          title="Nothing here"
          text={
            directionTab === 'received'
              ? 'No requests match this filter.'
              : 'You have not sent any requests with this status.'
          }
        />
      ) : (
        <div className="req-list">
          {filteredList.map((req) => {
            const dev = findDeveloperByUsername(req.username);
            const displayName = dev ? dev.name : req.username;

            return (
              <article key={req.id} className="card req">
                <Avatar name={displayName} size={48} />

                <div className="grow">
                  <div className="row gap wrap">
                    <strong>{displayName}</strong>
                    <span className="muted small">@{req.username}</span>
                    <Badge tone={STATUS_TONES[req.status] || 'default'}>
                      {req.status}
                    </Badge>
                  </div>

                  <p className="req-project">{req.project}</p>
                  <p className="muted">{req.message}</p>
                  <p className="muted small">{req.time}</p>
                </div>

                <div className="req-actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/u/${req.username}`)}
                  >
                    View profile
                  </Button>

                  {directionTab === 'received' && req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        icon="check"
                        onClick={() => respondToRequest(req.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-ghost"
                        icon="x"
                        onClick={() => respondToRequest(req.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {directionTab === 'received' && req.status === 'accepted' && dev && (
                    <Button
                      size="sm"
                      icon="mail"
                      onClick={() => {
                        window.location.href = `mailto:${dev.email}`;
                      }}
                    >
                      Email {dev.name.split(' ')[0]}
                    </Button>
                  )}

                  {directionTab === 'sent' && req.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelRequest(req.id)}
                    >
                      Cancel request
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

export default CollaborationRequests;
