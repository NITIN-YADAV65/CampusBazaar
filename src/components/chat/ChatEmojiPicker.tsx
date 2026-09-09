import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface ChatEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

interface EmojiItem {
  emoji: string;
  name: string;
  category: string;
}

const EMOJI_CATEGORIES: { id: string; name: string; icon: string; items: EmojiItem[] }[] = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😊',
    items: [
      { emoji: '😀', name: 'grinning face', category: 'smileys' },
      { emoji: '😃', name: 'smiling face with open mouth', category: 'smileys' },
      { emoji: '😄', name: 'smiling face with squint eyes', category: 'smileys' },
      { emoji: '😁', name: 'beaming face', category: 'smileys' },
      { emoji: '😆', name: 'laughing', category: 'smileys' },
      { emoji: '😅', name: 'sweat smile', category: 'smileys' },
      { emoji: '😂', name: 'joy tears laughing', category: 'smileys' },
      { emoji: '🤣', name: 'rolling on floor laughing', category: 'smileys' },
      { emoji: '🙂', name: 'slightly smiling', category: 'smileys' },
      { emoji: '🙃', name: 'upside down face', category: 'smileys' },
      { emoji: '😉', name: 'wink', category: 'smileys' },
      { emoji: '😊', name: 'blush', category: 'smileys' },
      { emoji: '😇', name: 'innocent angel', category: 'smileys' },
      { emoji: '🥰', name: 'smiling face with hearts', category: 'smileys' },
      { emoji: '😍', name: 'heart eyes love', category: 'smileys' },
      { emoji: '🤩', name: 'star eyes excited', category: 'smileys' },
      { emoji: '😘', name: 'kiss', category: 'smileys' },
      { emoji: '😋', name: 'yum delicious tongue', category: 'smileys' },
      { emoji: '😜', name: 'wink tongue playful', category: 'smileys' },
      { emoji: '🤪', name: 'zany face goofy', category: 'smileys' },
      { emoji: '😝', name: 'squint tongue', category: 'smileys' },
      { emoji: '🤑', name: 'money mouth rich', category: 'smileys' },
      { emoji: '🤗', name: 'hugging face', category: 'smileys' },
      { emoji: '🤫', name: 'shushing quiet secret', category: 'smileys' },
      { emoji: '🤔', name: 'thinking question wonder', category: 'smileys' },
      { emoji: '🤐', name: 'zipper mouth shut up', category: 'smileys' },
      { emoji: '🤨', name: 'raised eyebrow skeptical', category: 'smileys' },
      { emoji: '😐', name: 'neutral face okay', category: 'smileys' },
      { emoji: '😑', name: 'expressionless blank', category: 'smileys' },
      { emoji: '😏', name: 'smirk cool', category: 'smileys' },
      { emoji: '😒', name: 'unamused annoyed', category: 'smileys' },
      { emoji: '🙄', name: 'rolling eyes whatever', category: 'smileys' },
      { emoji: '😬', name: 'grimacing awkward', category: 'smileys' },
      { emoji: '🤥', name: 'lying pinocchio', category: 'smileys' },
      { emoji: '😌', name: 'relieved calm peaceful', category: 'smileys' },
      { emoji: '😔', name: 'pensive sad sorrow', category: 'smileys' },
      { emoji: '😴', name: 'sleeping tired zzz', category: 'smileys' },
      { emoji: '😷', name: 'mask medical sick', category: 'smileys' },
      { emoji: '🤒', name: 'thermometer fever ill', category: 'smileys' },
      { emoji: '🤕', name: 'bandage hurt injury', category: 'smileys' },
      { emoji: '🤢', name: 'nauseated disgust', category: 'smileys' },
      { emoji: '🤮', name: 'vomiting puke sick', category: 'smileys' },
      { emoji: '🥵', name: 'hot sweating', category: 'smileys' },
      { emoji: '🥶', name: 'cold freezing', category: 'smileys' },
      { emoji: '🥴', name: 'woozy dizzy tipsy', category: 'smileys' },
      { emoji: '😵', name: 'dizzy dead knocked out', category: 'smileys' },
      { emoji: '🤯', name: 'mind blown explosion shocked', category: 'smileys' },
      { emoji: '🤠', name: 'cowboy hat', category: 'smileys' },
      { emoji: '🥳', name: 'partying celebrate celebrate', category: 'smileys' },
      { emoji: '😎', name: 'sunglasses cool boss', category: 'smileys' },
      { emoji: '🤓', name: 'nerd glasses smart student', category: 'smileys' },
      { emoji: '🧐', name: 'monocle investigate analyze', category: 'smileys' },
      { emoji: '😕', name: 'confused huh', category: 'smileys' },
      { emoji: '😮', name: 'surprised open mouth wow', category: 'smileys' },
      { emoji: '😲', name: 'astonished gasp', category: 'smileys' },
      { emoji: '😳', name: 'flushed embarrassed red', category: 'smileys' },
      { emoji: '🥺', name: 'pleading puppy eyes please', category: 'smileys' },
      { emoji: '😦', name: 'frowning worried', category: 'smileys' },
      { emoji: '😨', name: 'scared afraid fear', category: 'smileys' },
      { emoji: '😰', name: 'anxious sweat stress', category: 'smileys' },
      { emoji: '😥', name: 'sad relieved tear', category: 'smileys' },
      { emoji: '😢', name: 'crying sad tear', category: 'smileys' },
      { emoji: '😭', name: 'loudly crying sobbing', category: 'smileys' },
      { emoji: '😱', name: 'screaming scared horrified', category: 'smileys' },
      { emoji: '😤', name: 'triumph huffing proud', category: 'smileys' },
      { emoji: '😡', name: 'pouting rage mad angry', category: 'smileys' },
      { emoji: '😠', name: 'angry cross annoyed', category: 'smileys' },
      { emoji: '🤬', name: 'cursing swearing furious', category: 'smileys' }
    ]
  },
  {
    id: 'gestures',
    name: 'Hands & Gestures',
    icon: '👍',
    items: [
      { emoji: '👍', name: 'thumbs up like good agree approve', category: 'gestures' },
      { emoji: '👎', name: 'thumbs down dislike bad disapprove', category: 'gestures' },
      { emoji: '👌', name: 'ok hand perfect great agree', category: 'gestures' },
      { emoji: '✌️', name: 'peace victory two', category: 'gestures' },
      { emoji: '🤞', name: 'fingers crossed good luck hope', category: 'gestures' },
      { emoji: '🤟', name: 'love you gesture rock', category: 'gestures' },
      { emoji: '🤘', name: 'sign of the horns rock metal', category: 'gestures' },
      { emoji: '🤙', name: 'call me shaka chill', category: 'gestures' },
      { emoji: '👈', name: 'point left', category: 'gestures' },
      { emoji: '👉', name: 'point right this', category: 'gestures' },
      { emoji: '👆', name: 'point up above look', category: 'gestures' },
      { emoji: '👇', name: 'point down below', category: 'gestures' },
      { emoji: '☝️', name: 'point index up one', category: 'gestures' },
      { emoji: '✋', name: 'raised hand stop high five', category: 'gestures' },
      { emoji: '🤚', name: 'back of hand', category: 'gestures' },
      { emoji: '🖐️', name: 'hand with fingers splayed five', category: 'gestures' },
      { emoji: '👋', name: 'wave hello goodbye hi bye', category: 'gestures' },
      { emoji: '👏', name: 'clapping applaud bravo', category: 'gestures' },
      { emoji: '🙌', name: 'raising hands celebration praise', category: 'gestures' },
      { emoji: '👐', name: 'open hands', category: 'gestures' },
      { emoji: '🤲', name: 'palms up together', category: 'gestures' },
      { emoji: '🤝', name: 'handshake deal agreement partnership', category: 'gestures' },
      { emoji: '🙏', name: 'folded hands pray thank you please namaste', category: 'gestures' },
      { emoji: '✍️', name: 'writing hand write notes study', category: 'gestures' },
      { emoji: '💪', name: 'flexed biceps strong muscle workout power', category: 'gestures' }
    ]
  },
  {
    id: 'hearts',
    name: 'Hearts & Reactions',
    icon: '❤️',
    items: [
      { emoji: '❤️', name: 'red heart love like romance', category: 'hearts' },
      { emoji: '🧡', name: 'orange heart warm', category: 'hearts' },
      { emoji: '💛', name: 'yellow heart friendship happiness', category: 'hearts' },
      { emoji: '💚', name: 'green heart nature eco', category: 'hearts' },
      { emoji: '💙', name: 'blue heart trust peace', category: 'hearts' },
      { emoji: '💜', name: 'purple heart elegance', category: 'hearts' },
      { emoji: '🖤', name: 'black heart dark', category: 'hearts' },
      { emoji: '🤍', name: 'white heart pure peace', category: 'hearts' },
      { emoji: '💔', name: 'broken heart heartbreak sad', category: 'hearts' },
      { emoji: '❣️', name: 'heart exclamation emphasis', category: 'hearts' },
      { emoji: '💕', name: 'two hearts love', category: 'hearts' },
      { emoji: '💖', name: 'sparkling heart shiny love', category: 'hearts' },
      { emoji: '💗', name: 'growing heart beating', category: 'hearts' },
      { emoji: '💘', name: 'heart with arrow cupid', category: 'hearts' },
      { emoji: '✨', name: 'sparkles clean new shine magic star', category: 'hearts' },
      { emoji: '🔥', name: 'fire hot lit trending popular awesome', category: 'hearts' },
      { emoji: '💯', name: 'hundred points keep it real perfect 100', category: 'hearts' },
      { emoji: '🎉', name: 'party popper celebrate congratulations', category: 'hearts' },
      { emoji: '⭐', name: 'star favorite rating review', category: 'hearts' },
      { emoji: '🌟', name: 'glowing star bright shining', category: 'hearts' },
      { emoji: '💥', name: 'boom collision shock exciting', category: 'hearts' },
      { emoji: '✅', name: 'check mark verified done success yes correct', category: 'hearts' },
      { emoji: '❌', name: 'cross mark cancel no reject wrong', category: 'hearts' },
      { emoji: '⚠️', name: 'warning alert caution attention', category: 'hearts' },
      { emoji: '💡', name: 'light bulb idea smart thought', category: 'hearts' },
      { emoji: '💬', name: 'speech bubble chat message discussion', category: 'hearts' }
    ]
  },
  {
    id: 'campus',
    name: 'Campus & Items',
    icon: '📚',
    items: [
      { emoji: '📚', name: 'books study library homework college', category: 'campus' },
      { emoji: '📖', name: 'open book reading textbook', category: 'campus' },
      { emoji: '📝', name: 'memo note syllabus exam test', category: 'campus' },
      { emoji: '✏️', name: 'pencil stationery study sketch', category: 'campus' },
      { emoji: '🎒', name: 'backpack school bag student campus', category: 'campus' },
      { emoji: '🎓', name: 'graduation cap degree university convocation', category: 'campus' },
      { emoji: '💻', name: 'laptop macbook computer coding student tech', category: 'campus' },
      { emoji: '📱', name: 'mobile phone smartphone iphone android call', category: 'campus' },
      { emoji: '🎧', name: 'headphones audio music podcast', category: 'campus' },
      { emoji: '⌚', name: 'smartwatch watch time meetup', category: 'campus' },
      { emoji: '☕', name: 'coffee tea break study late night hostel', category: 'campus' },
      { emoji: '🍕', name: 'pizza food snack dinner lunch canteen', category: 'campus' },
      { emoji: '🍔', name: 'burger food canteen meal', category: 'campus' },
      { emoji: '🚲', name: 'bicycle cycle ride campus hostel commute', category: 'campus' },
      { emoji: '🚗', name: 'car ride vehicle commute', category: 'campus' },
      { emoji: '🏸', name: 'badminton sports game gym play', category: 'campus' },
      { emoji: '⚽', name: 'football soccer ball game ground', category: 'campus' },
      { emoji: '🏏', name: 'cricket bat ball match hostel play', category: 'campus' },
      { emoji: '🎮', name: 'video game gaming controller playstation', category: 'campus' },
      { emoji: '🏆', name: 'trophy win prize competition', category: 'campus' },
      { emoji: '💵', name: 'cash dollar money price rupee cost cash', category: 'campus' },
      { emoji: '🏷️', name: 'label price tag discount bargain deal', category: 'campus' },
      { emoji: '📦', name: 'package box delivery parcel item', category: 'campus' },
      { emoji: '🛒', name: 'shopping cart buy marketplace bazaar', category: 'campus' },
      { emoji: '📍', name: 'pin location meetup place unimall gate hostel', category: 'campus' },
      { emoji: '⏰', name: 'alarm clock time schedule on time', category: 'campus' }
    ]
  }
];

export const ChatEmojiPicker: React.FC<ChatEmojiPickerProps> = ({ isOpen, onClose, onSelectEmoji }) => {
  const [activeTab, setActiveTab] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus search input when opened
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredEmojis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      const activeCat = EMOJI_CATEGORIES.find(c => c.id === activeTab);
      return activeCat ? activeCat.items : [];
    }

    const results: EmojiItem[] = [];
    for (const cat of EMOJI_CATEGORIES) {
      for (const item of cat.items) {
        if (item.name.toLowerCase().includes(q) || item.emoji.includes(q)) {
          results.push(item);
        }
      }
    }
    return results;
  }, [searchQuery, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: '12px',
        width: '320px',
        maxWidth: 'calc(100vw - 32px)',
        height: '350px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
        animation: 'chatPickerFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header & Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            gap: '6px'
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search emoji (e.g., laugh, books, heart)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.8125rem',
              width: '100%',
              color: '#1e293b'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                color: '#94a3b8'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs (shown only when not actively searching) */}
      {!searchQuery && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#fafbfc',
            padding: '4px 8px',
            gap: '4px'
          }}
        >
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              title={cat.name}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                backgroundColor: activeTab === cat.id ? '#ffffff' : 'transparent',
                boxShadow: activeTab === cat.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          alignContent: 'start'
        }}
      >
        {filteredEmojis.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '2rem 1rem',
              color: '#94a3b8',
              fontSize: '0.8125rem'
            }}
          >
            No emojis found for &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredEmojis.map((item, idx) => (
            <button
              key={`${item.emoji}-${idx}`}
              type="button"
              onClick={() => {
                onSelectEmoji(item.emoji);
              }}
              title={item.name}
              style={{
                background: 'none',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.35rem',
                lineHeight: 1,
                padding: '6px 0',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, background-color 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.transform = 'scale(1.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {item.emoji}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
