import React from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import SilverGame from './SilverGame';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockWordData = {
  words: [
    { word: 'Test1', color: 'blue', points: 10 },
    { word: 'Test2', color: 'green', points: 5 },
    { word: 'Test3', color: 'red', points: 15 },
    { word: 'Test4', color: 'purple', points: 10 },
    { word: 'Test5', color: 'orange', points: 5 },
    { word: 'Test6', color: 'pink', points: 15 },
    { word: 'Test7', color: 'cyan', points: 10 },
    { word: 'Test8', color: 'magenta', points: 5 },
    { word: 'Test9', color: 'lime', points: 15 },
    { word: 'Test10', color: 'teal', points: 10 },
    { word: 'Test11', color: 'brown', points: 5 },
  ],
};

describe('SilverGame Component', () => {
  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue({ data: mockWordData });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    mockedAxios.get.mockClear();
  });

  test('renders and initializes in Survival mode by default', async () => {
    // Wrap initial render in act and await it
    await act(async () => {
      render(<SilverGame />);
    });
    // Ensure Test1 is found after initial render and data fetch
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    
    expect(screen.getByText(/Silver's Word Challenge - Survival/i)).toBeInTheDocument();
    
    const timeStatItem = screen.getByText(/Time:/i).closest('.stat-item');
    expect(timeStatItem).toBeInstanceOf(HTMLElement);
    expect(within(timeStatItem as HTMLElement).getByText(/60s/i)).toBeInTheDocument();
    
    const powerStatItem = screen.getByText(/Power:/i).closest('.stat-item');
    expect(powerStatItem).toBeInstanceOf(HTMLElement);
    expect(within(powerStatItem as HTMLElement).getByText(/100/i)).toBeInTheDocument();
    
    // Test1 should still be there
    expect(screen.getByText('Test1')).toBeInTheDocument();
  });

  test('allows switching to Peaceful mode', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument(); // Initial load
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    mockedAxios.get.mockClear(); // Clear mock for the next call

    // Wrap mode switch fireEvent in act and await it
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Peaceful/i }));
    });
    // Expect words to be fetched again for the new mode
    expect(await screen.findByText('Test1')).toBeInTheDocument(); 
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/Silver's Word Challenge - Peaceful/i)).toBeInTheDocument();
    const timeStatItem = screen.getByText(/Time:/i).closest('.stat-item');
    expect(timeStatItem).toBeInstanceOf(HTMLElement);
    expect(within(timeStatItem as HTMLElement).getByText(/60s/i)).toBeInTheDocument();
    expect(screen.queryByText(/Power:/i)).not.toBeInTheDocument();
  });

  test('allows switching to Creative mode', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument(); // Initial load
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    mockedAxios.get.mockClear();

    // Wrap mode switch fireEvent in act and await it
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Creative/i }));
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/Silver's Word Challenge - Creative/i)).toBeInTheDocument();
    expect(screen.queryByText(/Time:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Power:/i)).not.toBeInTheDocument();
  });

  test('timer counts down in Survival mode', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    let timeStatItem = screen.getByText(/Time:/i).closest('.stat-item');
    expect(timeStatItem).toBeInstanceOf(HTMLElement);
    expect(within(timeStatItem as HTMLElement).getByText(/60s/i)).toBeInTheDocument();
    
    act(() => { // jest.advanceTimersByTime should be wrapped in act
      jest.advanceTimersByTime(1000);
    });
    // Re-query after timer advance to get updated element
    timeStatItem = await screen.findByText(/Time:/i).then(el => el.closest('.stat-item'));
    expect(timeStatItem).toBeInstanceOf(HTMLElement);
    expect(within(timeStatItem as HTMLElement).getByText(/59s/i)).toBeInTheDocument();
    
    act(() => { // jest.advanceTimersByTime should be wrapped in act
      jest.advanceTimersByTime(5000);
    });
    timeStatItem = await screen.findByText(/Time:/i).then(el => el.closest('.stat-item'));
    expect(timeStatItem).toBeInstanceOf(HTMLElement);
    expect(within(timeStatItem as HTMLElement).getByText(/54s/i)).toBeInTheDocument();
  });

  test('timer does not run in Creative mode', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    mockedAxios.get.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Creative/i }));
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    
    expect(screen.queryByText(/Time:/i)).not.toBeInTheDocument();
    // Wrap timer advance in act, though it should have no effect
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText(/Time:/i)).not.toBeInTheDocument(); // Still no timer
  });

  test('Survival Mode: clicking a word reduces power and score increases', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument(); 
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    const wordToClick = screen.getByText('Test1');
    // Wrap fireEvent in act as it causes state updates
    await act(async () => {
        fireEvent.click(wordToClick);
    });

    // Assertions for power and score update
    await waitFor(() => { 
      const powerStatItem = screen.getByText(/Power:/i).closest('.stat-item');
      expect(powerStatItem).toBeInstanceOf(HTMLElement);
      expect(within(powerStatItem as HTMLElement).getByText(/90/i)).toBeInTheDocument();
      
      const scoreStatItem = screen.getByText(/Score:/i).closest('.stat-item');
      expect(scoreStatItem).toBeInstanceOf(HTMLElement);
      expect(within(scoreStatItem as HTMLElement).getByText(/10/i)).toBeInTheDocument();
    });
    
    // Assert that the clicked word is gone
    await waitFor(() => {
      expect(screen.queryByText('Test1')).not.toBeInTheDocument();
    });

    // Assert that a new word has appeared (assuming mockWordData has enough words)
    expect(await screen.findByText('Test11')).toBeInTheDocument();
  });

  test('Survival Mode: game ends when time runs out (loss)', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Wrap timer advance in act
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // Assert game over message and play again button
    await waitFor(() => expect(screen.getByText(/Game Over! Time ran out./i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
  });

  test('Survival Mode: game ends when power reaches 0 (win)', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    for (let i = 1; i <= 10; i++) {
      const wordElement = await screen.findByText(`Test${i}`);
      // Wrap each click in act
      await act(async () => {
          fireEvent.click(wordElement);
      });
    }
    
    // Assert victory message
    await waitFor(() => {
        expect(screen.getByText(/Victory! You survived the onslaught!/i)).toBeInTheDocument();
    }, { timeout: 3000 }); // Increased timeout for safety, though likely not needed with proper act usage
    expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
  });

  test('Peaceful Mode: clicking a word increases score, no power change', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    mockedAxios.get.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Peaceful/i }));
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    expect(screen.queryByText(/Power:/i)).not.toBeInTheDocument();
    
    const initialScoreStatItem = screen.getByText(/Score:/i).closest('.stat-item');
    expect(initialScoreStatItem).toBeInstanceOf(HTMLElement);
    expect(within(initialScoreStatItem as HTMLElement).getByText(/0/i)).toBeInTheDocument();

    // Wrap click in act
    await act(async () => {
        fireEvent.click(screen.getByText('Test1'));
    });

    await waitFor(() => {
      const scoreStatItem = screen.getByText(/Score:/i).closest('.stat-item');
      expect(scoreStatItem).toBeInstanceOf(HTMLElement);
      expect(within(scoreStatItem as HTMLElement).getByText(/10/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Power:/i)).not.toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.queryByText('Test1')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('Test11')).toBeInTheDocument();
  });

  test('Creative Mode: clicking a word increases score, no power/timer change', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    mockedAxios.get.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Creative/i }));
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    expect(screen.queryByText(/Power:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Time:/i)).not.toBeInTheDocument();

    // Wrap click in act
    await act(async () => {
        fireEvent.click(screen.getByText('Test1'));
    });
    
    await waitFor(() => {
      const scoreStatItem = screen.getByText(/Score:/i).closest('.stat-item');
      expect(scoreStatItem).toBeInstanceOf(HTMLElement);
      expect(within(scoreStatItem as HTMLElement).getByText(/10/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Power:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Time:/i)).not.toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.queryByText('Test1')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('Test11')).toBeInTheDocument();
  });

  test('Play Again button resets the game in the current mode', async () => {
    await act(async () => {
      render(<SilverGame />);
    });
    expect(await screen.findByText('Test1')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(60000);
    });
    await waitFor(() => expect(screen.getByText(/Game Over! Time ran out./i)).toBeInTheDocument());
    
    mockedAxios.get.mockClear();
    // Wrap click in act
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Play Again/i }));
    });
    
    expect(await screen.findByText('Test1')).toBeInTheDocument(); // Expect words to be fetched again
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/Silver's Word Challenge - Survival/i)).toBeInTheDocument();
    
    const timeStatItem = screen.getByText(/Time:/i).closest('.stat-item');
    expect(timeStatItem).toBeInstanceOf(HTMLElement);
    expect(within(timeStatItem as HTMLElement).getByText(/60s/i)).toBeInTheDocument();
    
    const powerStatItem = screen.getByText(/Power:/i).closest('.stat-item');
    expect(powerStatItem).toBeInstanceOf(HTMLElement);
    expect(within(powerStatItem as HTMLElement).getByText(/100/i)).toBeInTheDocument();
    
    expect(screen.getByText('Test1')).toBeInTheDocument();
    expect(screen.queryByText(/Game Over! Time ran out./i)).not.toBeInTheDocument();
  });

});
