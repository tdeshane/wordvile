import React from 'react';
import { render, act } from '@testing-library/react';
import axios from 'axios';
import { SilverProvider, useSilver, SilverState } from './SilverContext';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockInitialSilverState: SilverState = {
  name: "Silver",
  title: "Princess of Wordvile",
  state: "corrupted",
  appearance: {
    eyes: "purple",
    aura: "dangerous purple mist",
    form: "ethereal, floating"
  },
  description: "A powerful being corrupted by Menchuba, capable of creating and draining words.",
  dialogue: {
    corrupted: ["We are one...", "The power... it consumes..."],
    redeemed: ["The light returns!", "I am free!"]
  }
};

const TestConsumerComponent = () => {
  const context = useSilver();
  return (
    <div>
      <span data-testid="silver-name">{context.silverState.name}</span>
      <span data-testid="silver-state">{context.silverState.state}</span>
      <button onClick={() => context.updateSilverState('redeemed')}>Redeem</button>
      <button onClick={() => context.absorbEmeralds(10)}>Absorb</button>
      <button onClick={() => context.drainWords(5)}>Drain</button>
    </div>
  );
};

describe('SilverContext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
  });

  test('SilverProvider fetches initial state and provides context', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockInitialSilverState });

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useSilver();
      return null;
    };

    await act(async () => {
      render(
        <SilverProvider>
          <TestComponent />
        </SilverProvider>
      );
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/silver/state'));
    expect(contextValue.silverState.name).toBe("Silver");
    expect(contextValue.silverState.state).toBe("corrupted");
  });

  test('absorbEmeralds calls API and updates state', async () => {
    const updatedStateOnAbsorb: SilverState = {
      ...mockInitialSilverState,
      description: "Absorbed 10 emeralds."
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockInitialSilverState }); // For initial load
    mockedAxios.post.mockResolvedValueOnce({ data: updatedStateOnAbsorb });

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useSilver();
      return <button onClick={() => contextValue.absorbEmeralds(10)}>Absorb</button>;
    };

    const { getByText } = render(
      <SilverProvider>
        <TestComponent />
      </SilverProvider>
    );

    // Wait for initial state load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); 
    });

    await act(async () => {
      getByText('Absorb').click();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/silver/absorb'), { emeralds: 10 });
    expect(contextValue.silverState.description).toBe("Absorbed 10 emeralds.");
  });

  test('drainWords calls API and updates state', async () => {
    const updatedStateOnDrain: SilverState = {
      ...mockInitialSilverState,
      description: "Drained 5 words."
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockInitialSilverState }); // For initial load
    mockedAxios.post.mockResolvedValueOnce({ data: updatedStateOnDrain });

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useSilver();
      return <button onClick={() => contextValue.drainWords(5)}>Drain</button>;
    };

    const { getByText } = render(
      <SilverProvider>
        <TestComponent />
      </SilverProvider>
    );
    
    // Wait for initial state load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      getByText('Drain').click();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/silver/drain'), { words: 5 });
    expect(contextValue.silverState.description).toBe("Drained 5 words.");
  });

  test('updateSilverState updates the state locally', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockInitialSilverState });

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useSilver();
      return <button onClick={() => contextValue.updateSilverState('redeemed')}>Redeem</button>;
    };

    const { getByText } = render(
      <SilverProvider>
        <TestComponent />
      </SilverProvider>
    );

    // Wait for initial state load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      getByText('Redeem').click();
    });

    expect(contextValue.silverState.state).toBe('redeemed');
  });

  test('useSilver throws error when not used within a SilverProvider', () => {
    // Suppress console.error for this test as React will log an error
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => render(<TestConsumerComponent />)).toThrow('useSilver must be used within a SilverProvider');
    
    console.error = originalError; // Restore console.error
  });

  test('absorbEmeralds handles API error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockInitialSilverState });
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useSilver();
      return <button onClick={async () => { 
        try { await contextValue.absorbEmeralds(10); } catch (e) { /* error caught */ }
      }}>Absorb</button>;
    };

    const { getByText } = render(
      <SilverProvider>
        <TestComponent />
      </SilverProvider>
    );

    // Wait for initial state load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      getByText('Absorb').click();
    });

    // Check that state wasn't changed from initial due to error
    expect(contextValue.silverState.description).toBe(mockInitialSilverState.description);
    // Optionally, check if console.error was called (SilverContext logs it)
  });

});
