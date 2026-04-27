import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MarketType = 'option' | 'equity' | 'commodity' | 'crypto';

interface MarketState {
  selectedMarket: MarketType;
}

const initialState: MarketState = {
  selectedMarket: 'equity',
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setSelectedMarket: (state, action: PayloadAction<MarketType>) => {
      state.selectedMarket = action.payload;
    },
  },
});

export const { setSelectedMarket } = marketSlice.actions;
export default marketSlice.reducer;
