import React from 'react';

const SilverChallengeContent: React.FC = () => {
  return (
    <div className="silver-challenge-content" style={{ padding: '20px', textAlign: 'left' }}>
      <h1>Silver's Story: Corruption and Redemption</h1>

      <section style={{ marginBottom: '20px' }}>
        <h2>Introduction</h2>
        <p>Silver, the benevolent Princess of Wordvile, was known for her ability to weave words of power, bringing joy and prosperity to her kingdom. She was the guardian of the Great Lexicon, a source of all words and their meanings. Her castle, a beacon of light, stood at the heart of Wordvile.</p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>The Corruption</h2>
        <p>Menchuba, a malevolent sorcerer banished long ago, sought to control Wordvile by corrupting its source of power. He couldn't directly seize the Great Lexicon, so he targeted Silver.</p>
        <p>Using a dark relic, the "Orb of Silence," Menchuba slowly poisoned Silver's mind. Her words became twisted, her creations chaotic. The vibrant colors of her magic turned into a dangerous purple mist. Her eyes, once sparkling blue, now glowed with a purple hue. She became a puppet, unknowingly aiding Menchuba in his quest to drain Wordvile of its linguistic energy.</p>
        <p>The kingdom began to suffer. Words would vanish from books, conversations would become muddled, and creativity waned. Silver, in her corrupted state, started draining words from the kingdom and absorbing "emeralds of thought" (crystallized ideas) to fuel Menchuba's power.</p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>The Challenge - Path to Redemption</h2>
        <p>The player, a wandering wordsmith, arrives in Wordvile and learns of Silver's plight from the few remaining untainted scholars. They are told that to save Silver and Wordvile, they must:</p>

        <h3 style={{ marginTop: '15px', marginBottom: '5px' }}>1. Understand the Corruption:</h3>
        <ul style={{ listStylePosition: 'inside', paddingLeft: '20px' }}>
          <li>Gather clues about Menchuba and the Orb of Silence.</li>
          <li>Witness Silver's corrupted actions (draining words, erratic behavior).</li>
          <li>Learn about the "emeralds of thought" and their significance.</li>
        </ul>

        <h3 style={{ marginTop: '15px', marginBottom: '5px' }}>2. The Trials of Wordcraft:</h3>
        <ul style={{ listStylePosition: 'inside', paddingLeft: '20px' }}>
          <li><strong>Trial of Scrambled Words:</strong> Menchuba has scrambled the ancient texts. The player must unscramble key phrases that reveal Silver's true nature and Menchuba's weakness. (Connects to WordScrambleGame)</li>
          <li><strong>Trial of Lost Meanings:</strong> Important words have lost their definitions due to the corruption. The player must play a game of Hangman to restore these definitions, using context clues from old scrolls. (Connects to HangmanGame)</li>
          <li><strong>Trial of Hidden Truths:</strong> Menchuba has hidden fragments of a counter-spell within a grid of letters. The player must find these words in a WordSearch game to piece together the incantation. (Connects to WordSearchGame)</li>
        </ul>

        <h3 style={{ marginTop: '15px', marginBottom: '5px' }}>3. Confronting the Corruption:</h3>
        <ul style={{ listStylePosition: 'inside', paddingLeft: '20px' }}>
          <li><strong>The Orb's Influence:</strong> After completing the trials, the player learns that the Orb of Silence feeds on negative emotions and linguistic chaos.</li>
          <li><strong>Silver's Inner Conflict:</strong> The player discovers that a part of Silver is still fighting the corruption. She leaves cryptic clues in the form of "Echoes of Light" – nearly faded words of hope.</li>
        </ul>

        <h3 style={{ marginTop: '15px', marginBottom: '5px' }}>4. The Ritual of Cleansing:</h3>
        <ul style={{ listStylePosition: 'inside', paddingLeft: '20px' }}>
          <li><strong>Gathering Hope:</strong> The player must gather these "Echoes of Light" (perhaps by replaying word games with a specific focus or a new mini-game).</li>
          <li><strong>Weakening Menchuba:</strong> By restoring words and meaning, the player weakens Menchuba's hold and the Orb's power.</li>
          <li><strong>The Final Act - Silver's Choice:</strong> The player presents the gathered "Echoes of Light" to Silver. This empowers her to fight Menchuba's influence. The player might need to help her by "feeding" her words of power (a new game mechanic?) or by protecting her during a final confrontation.
            <ul style={{ listStylePosition: 'inside', paddingLeft: '20px', marginTop: '5px' }}>
              <li>The "absorb" action (currently absorbing emeralds for Menchuba) could be re-purposed. Perhaps she needs to absorb "Words of Purity" or "Emeralds of Hope".</li>
              <li>The "drain" action (currently draining words for Menchuba) could be reversed or used against Menchuba.</li>
            </ul>
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>Redemption</h2>
        <p>Silver, with the player's help, shatters the Orb of Silence and banishes Menchuba. Her appearance returns to normal – blue eyes, a gentle aura, and a radiant form. She thanks the player, and Wordvile begins to heal. The Great Lexicon is safe, and words regain their power. Silver, now wiser and stronger, rules justly, forever grateful to the wordsmith who saved her.</p>
      </section>

      <section>
        <h2>Post-Redemption</h2>
        <p>Silver offers new challenges to the player, testing their word skills in more advanced ways, perhaps creating new words or solving complex linguistic puzzles. She becomes a guide and an ally.</p>
      </section>
    </div>
  );
};

export default SilverChallengeContent;
