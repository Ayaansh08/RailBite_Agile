import { useOrderTracking } from './useOrderTracking';
import { ORDER_STATUS, getStatusLabel, ORDER_STATUS_LABELS } from './orderStatus';

const STATUS_STEPS = [
  ORDER_STATUS.Pending,
  ORDER_STATUS.Accepted,
  ORDER_STATUS.Preparing,
  ORDER_STATUS.OutForDelivery,
  ORDER_STATUS.Delivered,
];

function StepTimeline({ currentStatus }) {
  const isRejected = currentStatus === ORDER_STATUS.Rejected;

  if (isRejected) {
    return (
      <ol aria-label="Order steps">
        {STATUS_STEPS.map((step) => (
          <li key={step} style={{ opacity: 0.4 }}>
            {getStatusLabel(step)}
          </li>
        ))}
      </ol>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <ol aria-label="Order steps">
      {STATUS_STEPS.map((step, i) => {
        const isCurrent = step === currentStatus;
        const isPast = i < currentIndex;
        return (
          <li
            key={step}
            aria-current={isCurrent ? 'step' : undefined}
            style={{
              fontWeight: isCurrent ? 'bold' : 'normal',
              opacity: isPast ? 0.5 : 1,
            }}
          >
            {getStatusLabel(step)}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderTracker({ orderId, pollIntervalMs }) {
  const { order, error } = useOrderTracking(orderId, pollIntervalMs);

  if (!order && !error) {
    return <p>Loading order...</p>;
  }

  if (!order && error) {
    return (
      <div>
        <p role="alert">Could not load order. Please retry.</p>
      </div>
    );
  }

  const { status, vendorName, expectedArrivalTime } = order;
  const isRejected = status === ORDER_STATUS.Rejected;
  const isKnownStatus = status in ORDER_STATUS_LABELS;

  return (
    <section>
      <h2>{vendorName}</h2>
      {expectedArrivalTime && <p>Expected arrival: {expectedArrivalTime}</p>}

      {isRejected && (
        <p role="alert" style={{ color: 'red' }}>
          {getStatusLabel(status)} — Your order was rejected by the restaurant.
        </p>
      )}

      {!isKnownStatus && <p>{getStatusLabel(status)}</p>}

      <StepTimeline currentStatus={status} />

      {error && (
        <p role="alert">Connection issue — retrying shortly.</p>
      )}
    </section>
  );
}
