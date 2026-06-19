import type { Order } from '../types';

interface OrderPanelProps {
  orders: Order[];
  activeOrderIndex: number;
}

export function OrderPanel({ orders, activeOrderIndex }: OrderPanelProps) {
  const active = orders[activeOrderIndex];

  return (
    <section className="order-panel panel">
      <div className="panel-header">
        <span className="panel-title">☕ CUSTOMER ORDER</span>
        {orders.length > 1 && (
          <span className="panel-badge">
            {activeOrderIndex + 1}/{orders.length} IN QUEUE
          </span>
        )}
      </div>

      <div className="order-ticket">
        <div className="order-text">{active?.displayName ?? 'Waiting…'}</div>
      </div>

      {orders.length > 1 && (
        <div className="queue-list">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`queue-item${
                index === activeOrderIndex ? ' active' : index < activeOrderIndex ? ' done' : ''
              }`}
            >
              {index + 1}. {order.displayName}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}