import { useState } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'

export function AdminMQTTPage() {
  const [host, setHost] = useState('mqtt.evzonecharging.com')
  const [port, setPort] = useState('8883')
  const [tls, setTls] = useState(true)
  const [username, setUsername] = useState('evz_admin')
  const [password, setPassword] = useState('••••••••')
  const [ack, setAck] = useState('')

  const [pubTopic, setPubTopic] = useState('evz/test')
  const [pubQos, setPubQos] = useState('0')
  const [pubRetain, setPubRetain] = useState(false)
  const [pubPayload, setPubPayload] = useState('{"hello":"world"}')

  const toast = (m: string) => {
    setAck(m)
    setTimeout(() => setAck(''), 1400)
  }

  const connections = [
    { id: 'cli-442', client: 'OCPI-Bridge', ip: '10.0.0.21', lastSeen: '11:40', tx: 210, rx: 320, status: 'Connected' },
    { id: 'cli-330', client: 'OCPP-Dispatcher', ip: '10.0.0.22', lastSeen: '11:36', tx: 120, rx: 520, status: 'Connected' },
    { id: 'cli-199', client: 'MobileApp-API', ip: '10.0.0.33', lastSeen: '11:10', tx: 12, rx: 40, status: 'Disconnected' },
  ]

  const topics = [
    {
      topic: 'evz/ocpp/+/status',
      qos: 1,
      retained: false,
      lastMessage: '11:42',
      sample: '{"cp":"CP-A1","st":"Online"}',
    },
    {
      topic: 'evz/ocpi/locations',
      qos: 1,
      retained: true,
      lastMessage: '11:38',
      sample: '{"count":128}',
    },
    {
      topic: 'evz/app/alerts',
      qos: 0,
      retained: false,
      lastMessage: '11:28',
      sample: '{"sev":"high","msg":"Grid dip"}',
    },
  ]

  return (
    <DashboardLayout pageTitle="MQTT & Realtime">
      {ack && <div className="text-sm text-accent mb-4">{ack}</div>}

      {/* Broker settings */}
      <div className="card">
        <div className="card-title">Broker Configuration</div>
        <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          <div>
            <label className="grid gap-2 text-sm mb-3">
              <span className="text-muted">Host</span>
              <input value={host} onChange={(e) => setHost(e.target.value)} className="input" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm">
                <span className="text-muted">Port</span>
                <input value={port} onChange={(e) => setPort(e.target.value)} className="input" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-muted">TLS</span>
                <select value={tls ? 'Yes' : 'No'} onChange={(e) => setTls(e.target.value === 'Yes')} className="select">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>
            </div>
          </div>
          <div>
            <label className="grid gap-2 text-sm mb-3">
              <span className="text-muted">Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="input" />
            </label>
            <label className="grid gap-2 text-sm mb-3">
              <span className="text-muted">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </label>
            <button onClick={() => toast('Saved broker (demo)')} className="btn">
              Save
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Live connections */}
      <div className="card">
        <div className="card-title">Live Connections</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>IP</th>
                <th>Last seen</th>
                <th className="text-right">TX</th>
                <th className="text-right">RX</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.client}</td>
                  <td>{c.ip}</td>
                  <td>{c.lastSeen}</td>
                  <td className="text-right">{c.tx}</td>
                  <td className="text-right">{c.rx}</td>
                  <td>
                    <span className={`pill ${c.status === 'Connected' ? 'approved' : 'rejected'}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Topic monitor & Publish */}
      <div className="grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
        <div className="card">
          <div className="card-title">Topic Monitor</div>
          <div className="grid gap-3">
            {topics.map((t) => (
              <div key={t.topic} className="panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{t.topic}</div>
                  <div className="text-xs text-muted">
                    QoS {t.qos} • {t.retained ? 'Retained' : 'Live'} • {t.lastMessage}
                  </div>
                </div>
                <pre className="text-xs bg-panel2 border border-border-light rounded p-2 overflow-x-auto">{t.sample}</pre>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Publish Tester</div>
          <label className="grid gap-2 text-sm mb-3">
            <span className="text-muted">Topic</span>
            <input value={pubTopic} onChange={(e) => setPubTopic(e.target.value)} className="input" />
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <label className="grid gap-2 text-sm">
              <span className="text-muted">QoS</span>
              <select value={pubQos} onChange={(e) => setPubQos(e.target.value)} className="select">
                <option>0</option>
                <option>1</option>
                <option>2</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted">Retain</span>
              <select value={pubRetain ? 'Yes' : 'No'} onChange={(e) => setPubRetain(e.target.value === 'Yes')} className="select">
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>
            <span className="self-end text-xs text-muted">Use JSON for payload</span>
          </div>
          <label className="grid gap-2 text-sm mb-3">
            <span className="text-muted">Payload</span>
            <textarea
              rows={5}
              value={pubPayload}
              onChange={(e) => setPubPayload(e.target.value)}
              className="textarea font-mono text-xs"
            />
          </label>
          <div className="text-right">
            <button onClick={() => toast(`Published to ${pubTopic} (demo)`)} className="btn">
              Publish
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

