"""
Silver - The Princess of Wordvile
A powerful being corrupted by Menchuba, capable of creating and draining words.
"""

class Silver:
    def __init__(self):
        self.name = "Silver"
        self.title = "Princess of Wordvile"
        self.state = "corrupted"  # Can be 'corrupted' or 'redeemed'
        self.power = {
            "word_creation": 100,
            "word_drain": 100,
            "color_control": 90,
            "teleportation": 85
        }
        self.appearance = {
            "eyes": "purple" if self.state == "corrupted" else "silver",
            "aura": "dangerous purple mist" if self.state == "corrupted" else "shimmering silver light",
            "form": "ethereal, floating" if self.state == "corrupted" else "regal, standing"
        }
        self.dialogue = {
            "corrupted": [
                "VISITORS IN MY DOMAIN. CURIOUS. DIFFERENT. FAMILIAR?",
                "SHHHHH...",
                "YOUR WORDS ARE MINE TO TAKE..."
            ],
            "redeemed": [
                "I remember... the light of creation...",
                "Forgive me... I was lost...",
                "Together, we can restore Wordvile..."
            ]
        }
        self.abilities = {
            "word_drain": self.drain_words,
            "word_creation": self.create_words,
            "teleport": self.teleport,
            "emerald_absorption": self.absorb_emeralds
        }

    def drain_words(self, target):
        """Drain words and color from a target"""
        if self.state == "corrupted":
            current_words = target.get('current_words', 0)
            return {
                "effect": "drain",
                "amount": min(30, current_words),
                "color_drain": True
            }
        return None

    def create_words(self, target=None):
        """Create new words and meaning"""
        if self.state == "redeemed":
            return {
                "effect": "create",
                "amount": 20,
                "type": "positive"
            }
        return None

    def teleport(self, location):
        """Teleport to different locations in Wordvile"""
        return {
            "success": True,
            "location": location,
            "energy_cost": 15
        }

    def absorb_emeralds(self, emeralds):
        """Absorb emeralds to restore power"""
        return {
            "power_restored": min(50, emeralds * 2),
            "emeralds_used": emeralds
        }

    def update_state(self, new_state):
        """Update Silver's state between corrupted and redeemed"""
        if new_state in ["corrupted", "redeemed"]:
            self.state = new_state
            self.appearance["eyes"] = "purple" if self.state == "corrupted" else "silver"
            self.appearance["aura"] = "dangerous purple mist" if self.state == "corrupted" else "shimmering silver light"
            self.appearance["form"] = "ethereal, floating" if self.state == "corrupted" else "regal, standing"

    def get_description(self):
        """Get a description of Silver based on her current state"""
        return f"{self.name}, the {self.title}, appears as a {self.appearance['form']} figure with {self.appearance['eyes']} eyes, surrounded by {self.appearance['aura']}."
