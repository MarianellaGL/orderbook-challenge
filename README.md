# Orderbook Viewer

A real-time orderbook viewer built with React and Next.js that displays live market depth data from Binance.

## Quick Start

### Docker (Recommended)

```bash
docker build -t orderbook-challenge .
docker run -p 3000:3000 orderbook-challenge
```

Then open [http://localhost:3000](http://localhost:3000)

### Local Development

```bash
npm install
npm run dev
```

## Features

### Core Requirements

- **Asset Selector**: 5 trading pairs (BTC, ETH, SOL, BNB, XRP)
- **Orderbook Display**: 10 levels for bids and asks with color coding
- **Live Updates**: WebSocket connection with real-time data

### Bonus Features

- **Spread Indicator**: Shows spread value and percentage
- **Depth Visualization**: Horizontal bars showing relative volume
- **WebSocket**: Real-time updates instead of polling
- **Unit Tests**: 25 tests covering core logic

## Architecture & Design Decisions

### State Management: Zustand

Chose Zustand over Context API for:

- Built-in selector support prevents unnecessary re-renders
- No provider wrapper needed
- Simple API with minimal boilerplate
- SSR compatible out of the box

### Data Structure: Map-based Storage

Order levels are stored in `Map<string, number>` for O(1) price lookups when applying deltas, then converted to sorted arrays only when rendering.

### WebSocket Strategy

Using Binance's diff depth stream (`@depth@1000ms`) with snapshot synchronization:

1. Connect to WebSocket, buffer incoming deltas
2. Fetch REST snapshot
3. Apply buffered deltas where `updateId > snapshotId`
4. Continue processing live deltas

This ensures no data gaps between snapshot and live stream.

### Performance Optimizations

- **Batched Updates**: UI updates every 1 seconds to reduce renders
- **Delta Deduplication**: Skip updates when quantity hasn't changed
- **Visibility API**: Pause WebSocket when tab is hidden to save resources
- **Memoization**: `React.memo` with custom comparators on order rows
- **Pending Buffer Limit**: Cap at 50 deltas to prevent memory buildup

### Responsive Design

Mobile-first approach using Tailwind breakpoints:

- Single column layout on mobile
- Two column orderbook on tablet+
- Adaptive font sizes and spacing

## Trade-offs

| Decision            | Trade-off                                                |
| ------------------- | -------------------------------------------------------- |
| 1s batch interval   | Slower UI updates but significantly lower resource usage |
| 1s WebSocket stream | Less granular than 100ms but 10x fewer messages          |
| Client-side only    | No SSR for orderbook data, but simpler architecture      |
| Fixed 10 levels     | Limited depth view but consistent performance            |

## Project Structure

```
modules/
├── orderbook/
│   ├── api/           # Binance REST client
│   ├── components/    # UI components
│   ├── hooks/         # Custom hooks
│   ├── realtime/      # WebSocket & reconciliation
│   ├── state/         # Zustand store
│   └── types.ts       # TypeScript types
└── shared/
    ├── config.ts      # Environment config
    └── format.ts      # Number formatting
```

## What I Would Improve With More Time

1. **Web Worker**: Move WebSocket and delta processing to a worker thread
2. **Virtual Scrolling**: For displaying more than 10 levels efficiently
3. **Connection Quality Indicator**: Show latency and message rate
4. **Price Alerts**: Notify when price crosses thresholds
5. **Historical Depth**: Show depth changes over time
6. **E2E Tests**: Playwright tests for critical user flows
7. **Error Boundary**: Better error recovery with retry logic

## Configuration

Environment variables (`.env.local`):

```env
NEXT_PUBLIC_BINANCE_REST_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_BINANCE_WS_URL=wss://stream.binance.com:9443/ws
NEXT_PUBLIC_BATCH_INTERVAL_MS=3000
NEXT_PUBLIC_MAX_LEVELS=10
```

## Testing

```bash
npm test
```

Runs 25 tests covering:

- Delta application logic
- Snapshot initialization
- Price/quantity formatting
- Update ID validation
