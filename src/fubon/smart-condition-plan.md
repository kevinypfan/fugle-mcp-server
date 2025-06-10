# Smart Condition Tools Implementation Plan

## Overview
This document outlines the implementation plan for adding smart condition (條件單) tools to the Fubon MCP server. The implementation will provide comprehensive conditional trading capabilities including single/multi conditions, time-slice orders, and trail profit orders.

## Architecture Design

### Directory Structure
```
src/fubon/smart-condition/
├── index.ts                      # Main registration function
├── types.ts                      # TypeScript type definitions
├── single-condition.ts           # Single condition order tool
├── multi-condition.ts            # Multi condition order tool
├── time-slice-order.ts           # Time slice order tool
├── trail-profit.ts               # Trail profit order tool
├── cancel-condition.ts           # Cancel condition order tool
├── get-condition-by-id.ts        # Get condition by ID tool
├── get-condition-order.ts        # Get active condition orders tool
├── get-condition-history.ts      # Get condition history tool
├── get-time-slice-order.ts       # Get time slice order details tool
├── get-trail-order.ts            # Get trail orders tool
├── get-trail-history.ts          # Get trail history tool
├── descriptions/
│   ├── single-condition.md       # Single condition API description
│   ├── multi-condition.md        # Multi condition API description  
│   ├── time-slice-order.md       # Time slice order API description
│   ├── trail-profit.md           # Trail profit API description
│   ├── cancel-condition.md       # Cancel condition API description
│   ├── get-condition-by-id.md    # Get condition by ID API description
│   ├── get-condition-order.md    # Get condition order API description
│   ├── get-condition-history.md  # Get condition history API description
│   ├── get-time-slice-order.md   # Get time slice order API description
│   ├── get-trail-order.md        # Get trail order API description
│   └── get-trail-history.md      # Get trail history API description
└── references/
    ├── single-condition.json     # API response field descriptions
    ├── multi-condition.json      # API response field descriptions
    ├── time-slice-order.json     # API response field descriptions
    ├── trail-profit.json         # API response field descriptions
    ├── cancel-condition.json     # API response field descriptions
    ├── condition-by-id.json      # API response field descriptions
    ├── condition-order.json      # API response field descriptions
    ├── condition-history.json    # API response field descriptions
    ├── time-slice-details.json   # API response field descriptions
    ├── trail-order.json          # API response field descriptions
    └── trail-history.json        # API response field descriptions
```

### Integration Points

1. **Main Fubon Module (`src/fubon/index.ts`)**
   - Add import for smart condition tools registration
   - Register smart condition tools in constructor

2. **Trade Tools Index (`src/fubon/trade/index.ts`)**
   - Add smart condition tools to the trade tools registration

## Implementation Phases

### Phase 1: Core Infrastructure
- Create TypeScript type definitions for all smart condition objects
- Implement basic tool registration structure
- Set up reference JSON files for testing

### Phase 2: Condition Management Tools
- Implement single condition order creation
- Implement multi condition order creation
- Implement condition cancellation
- Implement condition query tools

### Phase 3: Advanced Order Types
- Implement time slice order functionality
- Implement trail profit order functionality
- Implement specialized query tools for advanced orders

### Phase 4: Integration & Testing
- Integrate with main Fubon MCP module
- Add comprehensive error handling
- Create test cases and documentation

## API Documentation Mapping

Each smart condition tool corresponds to specific documentation in the Fubon Neo SDK:

| Tool | Fubon SDK Documentation Path |
|------|------------------------------|
| single-condition.ts | `/docs/smart-condition/library/python/SingleCondition.md` |
| multi-condition.ts | `/docs/smart-condition/library/python/MultiCondition.md` |
| time-slice-order.ts | `/docs/smart-condition/library/python/timeslice/TimeSliceOrder.md` |
| trail-profit.ts | `/docs/smart-condition/library/python/trailprofit/TrailOrder.md` |
| cancel-condition.ts | `/docs/smart-condition/library/python/CancelCondition.md` |
| get-condition-by-id.ts | `/docs/smart-condition/library/python/GetConditionById.md` |
| get-condition-order.ts | `/docs/smart-condition/library/python/GetConditionOrder.md` |
| get-condition-history.ts | `/docs/smart-condition/library/python/GetConditionHistory.md` |
| get-time-slice-order.ts | `/docs/smart-condition/library/python/timeslice/GetTimeSliceOrder.md` |
| get-trail-order.ts | `/docs/smart-condition/library/python/trailprofit/GetTrailOrder.md` |
| get-trail-history.ts | `/docs/smart-condition/library/python/trailprofit/GetTrailHistory.md` |

## Technical Specifications

### Core Types to Implement

```typescript
// Condition trigger types
interface Condition {
  market_type: 'Reference' | 'Scheduled';
  symbol: string;
  trigger: 'BidPrice' | 'AskPrice' | 'MatchedPrice' | 'TotalQuantity' | 'Time';
  trigger_value: number | string;
  comparison: 'GreaterThanOrEqual' | 'LessThanOrEqual' | 'GreaterThan' | 'LessThan';
}

// Order execution types
interface ConditionOrder {
  buy_sell: 'Buy' | 'Sell';
  symbol: string;
  price: number;
  quantity: number;
  market_type: 'Common' | 'Fixing' | 'IntradayOdd' | 'Odd';
  price_type: 'Limit' | 'Market' | 'BidPrice' | 'AskPrice';
  time_in_force: 'ROD' | 'IOC' | 'FOK';
  order_type: 'Stock' | 'Margin' | 'Short';
}

// TPSL wrapper
interface TPSLWrapper {
  stop_sign: 'Full' | 'Partial' | 'UntilEnd';
  tp?: ConditionOrder;
  sl?: ConditionOrder;
  end_date?: string;
  intraday?: boolean;
}

// Trail order
interface TrailOrder {
  symbol: string;
  price: number;
  direction: 'Up' | 'Down';
  percentage: number;
  buysell: 'Buy' | 'Sell';
  quantity: number;
  price_type: string;
  diff: number;
}

// Time slice description
interface SplitDescription {
  method: 'Type1' | 'Type2' | 'Type3';
  interval: number;
  single_quantity: number;
  total_quantity: number;
  start_time: string;
  end_time: string;
}
```

### Tool Registration Pattern

Each tool will follow the existing pattern:
1. Define tool schema with proper input validation
2. Implement handler function with SDK calls
3. Add comprehensive error handling
4. Register with MCP server
5. Export registration function

### Error Handling Strategy

- Validate all input parameters according to Fubon SDK requirements
- Handle SDK-specific errors and convert to user-friendly messages
- Implement proper type checking for complex nested objects
- Provide clear error messages for common validation failures

### API Response Handling

All tools will return standardized responses:
```typescript
interface ToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

## Integration Steps

1. **Create smart-condition directory structure**
2. **Implement types.ts with all required interfaces**
3. **Create individual tool files following existing patterns**
4. **Update main index files to register new tools**
5. **Add reference JSON files for testing**
6. **Test integration with existing Fubon MCP setup**

## Testing Strategy

- Use reference JSON files to validate response structures
- Test with mock SDK responses initially
- Gradually integrate with real Fubon SDK testing
- Validate all error handling paths
- Test complex multi-condition scenarios

## Dependencies

- Existing Fubon SDK integration
- MCP server infrastructure
- TypeScript type system
- Current trade tools patterns

## Estimated Timeline

- Phase 1: 1-2 days
- Phase 2: 2-3 days  
- Phase 3: 2-3 days
- Phase 4: 1-2 days

Total: 6-10 days for full implementation

## Success Criteria

- All 12 smart condition tools implemented and working
- Proper TypeScript typing throughout
- Comprehensive error handling
- Integration with existing Fubon MCP architecture
- Consistent API patterns with other tools
- Complete reference documentation