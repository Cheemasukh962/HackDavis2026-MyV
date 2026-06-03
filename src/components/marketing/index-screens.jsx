import {
  Shield,
  Lock,
  BriefcaseMedical,
  Search,
  AlertTriangle,
  Users,
  MapPin,
  Cloud,
  Siren,
  MessageCircle,
  PenLine,
  LifeBuoy,
  Paperclip,
  Camera,
  Mic,
  Type,
  FileText,
  Bot,
  ChevronLeft,
  Send,
  Phone,
  Menu,
  UserCircle,
} from 'lucide-react';
import { HistoryIcon, SciToggleIcon, BackspaceIcon, HeartIcon, ClockIcon } from './index-icons';
import { StatusBar, AppHeader, BottomTabs } from './index-phone';
import { getSourceBrand } from '../../utils/sourceBrands';
import styles from '../../styles/marketing/marketing.module.css';
import weatherStyles from '../../styles/weather-mode/weathercover.module.css';

const NEWS_MOCK_FEEDS = {
  today: {
    title: 'Discover',
    label: 'News+',
    activeTab: 'today',
    filters: ['All', 'Tech', 'Science', 'Economy'],
    hero: {
      tag: 'Top Story',
      source: 'Reuters',
      headline: 'Dow, S&P 500 scale peaks as HPE, Alphabet fuel AI momentum',
      summary: 'Investors pushed major indexes higher as new infrastructure bets strengthened confidence in the AI buildout.',
      image: 'https://cdn.zonebourse.com/static/resize/768/432//images/reuters/2026-05/2026-05-28T092715Z_1_LYNXMPEM4R0IW_RTROPTP_4_USA-STOCKS.JPG',
    },
    stories: [
      { source: 'Associated Press', headline: 'Protests, outbreaks and global unrest: May in AP photos', topic: 'In Pictures', image: 'https://www.ap.org/wp-content/uploads/bis-images/62614/AP26148457409326-375x375-f50_50.jpg' },
      { source: 'Reuters', headline: 'AI-driven labor displacement risks to remain low in near term, Bridgewater says', topic: 'Economy', image: 'linear-gradient(135deg, #14532d 0%, #16a34a 52%, #bbf7d0 100%)' },
      { source: 'The Guardian', headline: 'European cities prepare for another round of climate votes', topic: 'Climate', image: 'linear-gradient(135deg, #164e63 0%, #0891b2 55%, #a5f3fc 100%)' },
    ],
  },
  world: {
    title: 'World',
    label: 'World',
    activeTab: 'world',
    filters: ['All', 'Politics', 'Trade', 'Security'],
    hero: {
      tag: 'World',
      source: 'Reuters',
      headline: 'UN chief gives urgent climate warning as El Nino looms',
      summary: 'The latest climate briefing warns that warming oceans could intensify heat, storms, and food security pressures.',
      image: 'https://wmo.int/sites/default/files/styles/prose_1x/public/2026-06/Jul-Aug%202026%20El%20Ni%C3%B1o%20and%20La%20Ni%C3%B1a%20Update%20-%20square.png?itok=7xHJaXYa',
    },
    stories: [
      { source: 'BBC News', headline: 'Diplomats open new round of global security talks', topic: 'Diplomacy', image: 'https://wmo.int/sites/default/files/styles/prose_1x/public/2026-06/Jul-Aug%202026%20El%20Ni%C3%B1o%20and%20La%20Ni%C3%B1a%20Update%20-%20square.png?itok=7xHJaXYa' },
      { source: 'Al Jazeera', headline: 'Coalition talks stall as deadline approaches', topic: 'Politics', image: 'linear-gradient(135deg, #052e16 0%, #15803d 50%, #bbf7d0 100%)' },
      { source: 'Associated Press', headline: 'World Cup organizers monitor travel and security plans', topic: 'Global', image: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #bfdbfe 100%)' },
    ],
  },
  sports: {
    title: 'Sports',
    label: 'Sports',
    activeTab: 'sports',
    filters: ['All', 'NBA', 'Soccer', 'Olympics'],
    hero: {
      tag: 'Sports Highlight',
      source: 'Associated Press',
      headline: 'Wembanyama and the Spurs host New York to start NBA Finals',
      summary: "The championship series opens with a new matchup and one of basketball's biggest young stars at center stage.",
      image: 'https://cdn.nba.com/manage/2026/05/GettyImages_wemby_vs_knicks.png',
    },
    stories: [
      { source: 'ESPN', headline: 'Playoff race heats up as final week tips off', topic: 'NBA', image: 'https://cdn.nba.com/manage/2026/05/GettyImages_wemby_vs_knicks.png' },
      { source: 'Sports Illustrated', headline: 'World Cup concert series adds four-city summer slate', topic: 'Soccer', image: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 52%, #bae6fd 100%)' },
      { source: 'The Athletic', headline: 'Front offices prepare for a pivotal draft window', topic: 'Analysis', image: 'linear-gradient(135deg, #111827 0%, #4b5563 55%, #d1d5db 100%)' },
    ],
  },
};

function newsImageStyle(image) {
  if (!image) return undefined;
  if (/^https?:\/\//i.test(image)) {
    return { backgroundImage: `url("${image.replace(/"/g, '\\"')}")` };
  }
  return { background: image };
}

function NewsKiwiIcon() {
  return (
    <span className={styles.newsKiwiIcon} aria-hidden="true">
      <span />
    </span>
  );
}

function NewsSourceLogo({ source }) {
  const brand = getSourceBrand(source);
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  if (brand.domain) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
        alt=""
        className={styles.newsMockLogo}
      />
    );
  }

  return (
    <span className={styles.newsMockLogoFallback} style={brand.color ? { color: brand.color } : undefined}>
      {initials || 'N'}
    </span>
  );
}

function NewsMockHeader({ title }) {
  return (
    <>
      <StatusBar />
      <header className={styles.newsMockHeader}>
        <button type="button" aria-label="Menu"><Menu size={19} /></button>
        <div>
          <p><NewsKiwiIcon /> News+</p>
          <h2>{title}</h2>
        </div>
        <img className={styles.newsHeaderLogo} src="/resources/images/logos/news_icon_selected.png" alt="" />
        <button className={styles.newsHeaderAccount} type="button" aria-label="Account"><UserCircle size={21} /></button>
      </header>
    </>
  );
}

function NewsFilterRow({ filters }) {
  return (
    <div className={styles.newsMockFilterRow} aria-label="Filter stories">
      {filters.map((filter, index) => (
        <span className={index === 0 ? styles.newsMockFilterActive : ''} key={filter}>
          {filter}
        </span>
      ))}
    </div>
  );
}

function NewsMockTabs({ active }) {
  const tabs = [
    { id: 'today', label: 'News+', icon: 'logo' },
    { id: 'world', label: 'World', icon: 'world' },
    { id: 'sports', label: 'Sports', icon: 'sports' },
  ];
  return (
    <nav className={styles.newsMockTabs} aria-label="News sections">
      <div className={styles.newsMockTabsGroup}>
        {tabs.map((tab) => (
          <span className={active === tab.id ? styles.newsMockTabActive : ''} key={tab.id}>
            {tab.icon === 'logo' ? (
              <img src={active === tab.id ? '/resources/images/logos/news_icon_selected.png' : '/resources/images/logos/news_icon_unselected.png'} alt="" />
            ) : tab.icon === 'world' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9.5" />
                <ellipse cx="12" cy="12" rx="4" ry="9.5" />
                <line x1="2.5" y1="12" x2="21.5" y2="12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 21h8M12 17v4" />
                <path d="M6 3h12v8a6 6 0 0 1-12 0V3z" />
                <path d="M6 7H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
                <path d="M18 7h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
              </svg>
            )}
            <small>{tab.label}</small>
          </span>
        ))}
      </div>
      <span className={`${styles.newsMockSearchTab} ${active === 'search' ? styles.newsMockSearchTabActive : ''}`}>
        <Search size={21} />
      </span>
    </nav>
  );
}

function NewsPrivateButton() {
  return (
    <span className={styles.newsPrivateButton} aria-hidden="true" />
  );
}

function NewsMockStoryRow({ story }) {
  const brand = getSourceBrand(story.source);
  return (
    <article className={styles.newsMockStoryCard}>
      <span className={styles.newsMockStoryImage} style={newsImageStyle(story.image)} aria-hidden="true" />
      <div className={styles.newsMockStoryBody}>
        <span className={styles.newsMockPlusBar}>
          <span>News+</span>
        </span>
        <span className={styles.newsMockCardMeta}>
          <NewsSourceLogo source={story.source} />
          <strong style={brand.color ? { color: brand.color } : undefined}>{story.source}</strong>
          {story.topic && <small>{story.topic}</small>}
        </span>
        <h3>{story.headline}</h3>
        <span className={styles.newsMockDots} aria-hidden="true">...</span>
      </div>
    </article>
  );
}

function NewsMockFeedScreen({ feed }) {
  return (
    <div className={`${styles.mockScreen} ${styles.newsMockScreen}`}>
      <NewsMockHeader title={feed.title} />
      <main className={styles.newsMockBody}>
        <NewsFilterRow filters={feed.filters} />
        <section className={styles.newsMockHero} style={newsImageStyle(feed.hero.image)}>
          <span>{feed.hero.tag}</span>
          <NewsSourceLogo source={feed.hero.source} />
          <h3>{feed.hero.headline}</h3>
          <p>{feed.hero.summary}</p>
        </section>

        <div className={styles.newsMockSectionHead}>
          <strong>Latest</strong>
          <small>See All</small>
        </div>
        {feed.stories.slice(0, 1).map((story) => <NewsMockStoryRow story={story} key={story.headline} />)}
      </main>
      <NewsPrivateButton />
      <NewsMockTabs active={feed.activeTab} />
    </div>
  );
}

export function NewsPlusScreen() {
  return <NewsMockFeedScreen feed={NEWS_MOCK_FEEDS.today} />;
}

export function WorldNewsScreen() {
  return <NewsMockFeedScreen feed={NEWS_MOCK_FEEDS.world} />;
}

export function SportsNewsScreen() {
  return <NewsMockFeedScreen feed={NEWS_MOCK_FEEDS.sports} />;
}

export function NewsSearchScreen() {
  return (
    <div className={`${styles.mockScreen} ${styles.newsMockScreen}`}>
      <main className={styles.newsSearchOverlay}>
        <div className={styles.newsSearchHeader}>
          <label className={styles.newsSearchField}>
            <span className={styles.newsSearchIcon} aria-hidden="true" />
            <span>Search News</span>
          </label>
          <button type="button">Cancel</button>
        </div>

        <section className={styles.newsSearchBody}>
          <h2>Trending Searches</h2>
          <div className={styles.newsSearchList}>
            {['Climate deal', 'Tech antitrust', 'Space tourism', 'AI models', 'Electric vehicles', 'Cancer research'].map((term) => (
              <div className={styles.newsSearchTerm} key={term}>
                <span>{term}</span>
                <span className={styles.newsSearchIcon} aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>
      </main>
      <NewsPrivateButton />
    </div>
  );
}

export function NewsArticleScreen() {
  const article = NEWS_MOCK_FEEDS.today.hero;
  const brand = getSourceBrand(article.source);
  return (
    <div className={`${styles.mockScreen} ${styles.newsMockScreen}`}>
      <StatusBar />
      <header className={styles.newsArticleNav}>
        <button type="button" aria-label="Back"><ChevronLeft size={23} /></button>
        <span className={styles.newsArticleNavLogo}>
          <NewsSourceLogo source={article.source} />
        </span>
        <span aria-hidden="true" />
      </header>
      <main className={styles.newsArticleBody}>
        <div className={styles.newsArticleImage} style={newsImageStyle(article.image)}>
          <NewsSourceLogo source={article.source} />
        </div>
        <p className={styles.newsArticleSource} style={brand.color ? { color: brand.color } : undefined}>{article.source}</p>
        <h1>{article.headline}</h1>
        <p className={styles.newsArticleDate}>June 2, 2026 at 4:18 PM</p>
        <p>{article.summary}</p>
        <p>Markets climbed after a set of technology updates and infrastructure commitments renewed investor confidence across the sector.</p>
        <p>Analysts said the move reflects continuing demand for compute capacity, cloud services, and chips tied to new AI systems.</p>
      </main>
      <NewsPrivateButton />
    </div>
  );
}

export function WeatherScreen() {
  return (
    <div
      className={styles.mockScreen}
      style={{
        background: 'linear-gradient(180deg, rgba(14, 62, 116, 0.08), rgba(5, 21, 42, 0.22)), linear-gradient(155deg, #1174b8 0%, #51a9d8 46%, #c8e6ef 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      <div className={weatherStyles.sky}>
        <div className={weatherStyles.sun} style={{ width: 88, height: 88 }} />
        <div className={weatherStyles.cloudOne} style={{ width: 170, height: 56 }} />
        <div className={weatherStyles.cloudTwo} style={{ width: 150, height: 50 }} />
      </div>
      <div className={weatherStyles.shell}>
        <p className={weatherStyles.location}>Current Conditions</p>
        <h1 className={weatherStyles.temperature} style={{ fontSize: 100 }}>72&deg;</h1>
        <p className={weatherStyles.summary}>Weather Now</p>
        <span className={weatherStyles.forecastLink}>Open forecast</span>
      </div>
      <span className={styles.privateDot} />
    </div>
  );
}

export function CalculatorScreen() {
  const keys = ['⌫', 'AC', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '+/-', '0', '.', '='];
  return (
    <div className={`${styles.mockScreen} ${styles.calcScreen}`}>
      <StatusBar />
      <div className={styles.calcTopBar}>
        <span><HistoryIcon /></span>
        <span><SciToggleIcon /></span>
      </div>
      <div className={styles.calcDisplay}>1,240</div>
      <div className={styles.calcKeys}>
        {keys.map((key) => <span className={styles.calcKey} key={key}>{key === '⌫' ? <BackspaceIcon /> : key}</span>)}
      </div>
      <span className={styles.privateDot} />
    </div>
  );
}

export function CalculatorSciScreen() {
  const sciKeys = ['2ⁿᵈ', 'x²', 'x³', 'xʸ', 'eˣ', '10ˣ', '1/x', '√x', '∛x', 'ln', 'log', 'x!', 'sin', 'cos', 'tan', 'e', 'π', 'Rand'];
  const stdKeys = ['⌫', 'AC', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '+/-', '0', '.', '='];
  return (
    <div className={`${styles.mockScreen} ${styles.calcScreen} ${styles.calcSciScreen}`}>
      <StatusBar />
      <div className={styles.calcTopBar}>
        <span><HistoryIcon /></span>
        <span className={styles.sciActivBtn}><SciToggleIcon /></span>
      </div>
      <div className={styles.calcDisplaySci}>sin(30°)</div>
      <div className={styles.calcSciKeys}>
        {sciKeys.map((key) => <span className={styles.calcSciKey} key={key}>{key}</span>)}
      </div>
      <div className={`${styles.calcKeys} ${styles.calcKeysSci}`}>
        {stdKeys.map((key) => <span className={styles.calcKey} key={key}>{key === '⌫' ? <BackspaceIcon /> : key}</span>)}
      </div>
      <span className={styles.privateDot} />
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Home" />
      <div className={styles.screenBody}>
        <p className={styles.eyebrow}>Good evening</p>
        <h3>You&apos;re safe here.</h3>
        <p className={styles.screenLead}>Take a breath. Everything in this space is private.</p>
        <div className={styles.sosCard}>
          <span><Siren size={20} /></span>
          <div><strong>Send an SOS</strong><small>Alert your trusted contacts in one tap</small></div>
        </div>
        <div className={styles.setupCard}>
          <div className={styles.setupTitle}><Shield size={14} /> Your safety setup</div>
          <div className={styles.setupGrid}>
            <span><small>Contacts</small><strong>6</strong></span>
            <span className={`${styles.locationMini} ${styles.locationMiniOn}`}><small>Location</small><b><em>On</em><i /></b></span>
            <span><small>Backup</small><strong>12</strong></span>
          </div>
        </div>
        <div className={styles.journalTeaser}>
          <div className={styles.journalTop}><span>Others&apos; Journals</span><small>1 / 6</small></div>
          <div className={styles.journalCard}>
            <span className={styles.journalAvatar}>PK</span>
            <strong>PaperKite</strong>
            <small>Anonymous - May 5</small>
            <p>&quot;Started a new journal. The old one I had to leave behind. This one is mine.&quot;</p>
          </div>
        </div>
        <div className={styles.quickGrid}>
          <div><MessageCircle size={18} /><strong>Talk to an advocate</strong><small>Available now</small></div>
          <div><PenLine size={18} /><strong>Add to journal</strong><small>Save evidence</small></div>
          <div><LifeBuoy size={18} /><strong>Find help nearby</strong><small>Shelters and aid</small></div>
          <div><HeartIcon /><strong>A moment for you</strong><small>Grounding card</small></div>
        </div>
      </div>
      <BottomTabs active="Home" />
    </div>
  );
}

export function SosScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="SOS" />
      <div className={styles.screenBody}>
        <div className={styles.emergencyCard}>
          <span><Shield size={14} /> Emergency Alert</span>
          <strong>Ready to alert your contacts</strong>
          <small>One tap alerts your trusted contacts and shares your current location with them.</small>
        </div>
        <button className={styles.sendSosButton}>Send SOS</button>
        <div className={styles.statGrid}>
          <div><Users size={16} /><small>Trusted Contacts</small><strong>3 contacts</strong></div>
          <div className={styles.statActive}><MapPin size={16} /><small>Share Location</small><strong>On</strong><em /></div>
          <div><Cloud size={16} /><small>Evidence Backup</small><strong>Not started</strong></div>
          <div><ClockIcon /><small>Last Safety Check</small><strong>Never</strong></div>
        </div>
        <div className={styles.mapMock}>
          <span className={styles.mapDot} />
          <small>Current Location</small>
        </div>
        <div className={styles.notice}><AlertTriangle size={15} /> Alerts are sent without the app name.</div>
      </div>
      <BottomTabs active="SOS" />
    </div>
  );
}

export function ChatScreen() {
  const chats = ['SafeBot', 'CalmMeadow4681', 'CedarBrook', 'EmberMoth'];
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Chat" />
      <div className={styles.screenBody}>
        <div className={styles.segmented}><strong>Messages</strong><span>Friends</span></div>
        <div className={styles.infoPill}><BriefcaseMedical size={14} /> You can only message accepted friends.</div>
        <div className={styles.searchMock}><Search size={15} /> Search chats</div>
        <p className={styles.listLabel}>Always available</p>
        {chats.map((chat, index) => (
          <div className={styles.chatRow} key={chat}>
            <span>{chat.slice(0, 2).toUpperCase()}</span>
            <div><strong>{chat}</strong><small>{index === 0 ? 'I am here anytime. Try "I feel anxious".' : 'SOS: shared current location...'}</small></div>
          </div>
        ))}
      </div>
      <BottomTabs active="Chat" />
    </div>
  );
}

export function SafeBotScreen() {
  const messages = [
    { from: 'bot', text: "I'm here whenever you need me. How are you feeling right now?" },
    { from: 'me',  text: 'I feel scared to go home tonight' },
    { from: 'bot', text: "That sounds really hard. You don't have to face this alone. Would you like to talk, or should I help find resources nearby?" },
    { from: 'me',  text: 'I just need someone to talk to' },
    { from: 'bot', text: "I'm right here. Take your time. ❤️" },
  ];
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Chat" />
      <div className={styles.safebotThreadHeader}>
        <span className={styles.safebotBack}><ChevronLeft size={20} /></span>
        <span className={styles.safebotAvatar}>SB</span>
        <div className={styles.safebotTitle}>
          <div><strong>SafeBot</strong><Bot size={13} /></div>
          <span>Always available</span>
        </div>
      </div>
      <div className={styles.safebotPanel}>
        <div className={styles.safebotNotice}>
          <Lock size={12} /> Both of you are anonymous. Nothing is stored on this device.
        </div>
        <div className={styles.safebotMessages}>
          {messages.map((msg, i) => (
            <div className={`${styles.safebotRow} ${msg.from === 'me' ? styles.safebotRowMine : ''}`} key={i}>
              <div className={`${styles.safebotBubble} ${msg.from === 'me' ? styles.safebotBubbleMine : styles.safebotBubbleThem}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.safebotComposerWrap}>
          <div className={styles.safebotComposer}>
            <span className={styles.safebotInput}>Message SafeBot...</span>
            <span className={styles.safebotMic}><Mic size={14} /></span>
            <span className={styles.safebotSend}><Send size={14} /></span>
          </div>
        </div>
      </div>
      <BottomTabs active="Chat" />
    </div>
  );
}

export function JournalScreen() {
  const entries = [
    { type: 'text',  label: 'Note',  time: 'May 30, 9:14 PM',  text: 'He took my phone again tonight' },
    { type: 'image', label: 'Photo', time: 'May 28, 2:41 PM',  text: 'IMG_3842.jpg' },
    { type: 'audio', label: 'Audio', time: 'May 25, 11:08 AM', text: 'recording-1716638880.mp4' },
  ];
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Journal" />
      <div className={`${styles.screenBody} ${styles.journalBody}`}>
        <div className={styles.journalSecNotice}>
          <Lock size={11} /> Encrypted backup. Nothing saved on this device.
        </div>
        <div className={styles.journalBtnGrid}>
          {[
            { Icon: Camera, label: 'Media', hint: 'Photo or video' },
            { Icon: Mic,    label: 'Audio', hint: 'Record now' },
            { Icon: Type,   label: 'Text',  hint: 'Write a note' },
          ].map(({ Icon, label, hint }) => (
            <div className={styles.journalUploadBtn} key={label}>
              <span className={styles.journalUploadIcon}><Icon size={15} /></span>
              <strong>{label}</strong>
              <small>{hint}</small>
            </div>
          ))}
        </div>
        <div className={styles.journalSearch}>
          <Search size={12} /> Search entries...
        </div>
        <div className={styles.journalRecentHeader}>
          <span>Recent entries</span>
          <span>{entries.length} saved</span>
        </div>
        <div className={styles.journalFilters}>
          <span className={styles.journalFilterLabel}>Type</span>
          {['All', 'Photo', 'Text', 'Audio'].map((f, i) => (
            <span className={`${styles.journalChip} ${i === 0 ? styles.journalChipActive : ''}`} key={f}>{f}</span>
          ))}
        </div>
        {entries.map((e) => (
          <div className={styles.journalEntryCard} key={e.time}>
            <div className={styles.journalEntryIcon}>
              {e.type === 'text' ? <FileText size={18} /> : e.type === 'image' ? <Camera size={18} /> : <Mic size={18} />}
            </div>
            <div className={styles.journalEntryContent}>
              <div className={styles.journalEntryMeta}>
                <span className={styles.journalEntryType}>{e.label}</span>
                <span className={styles.journalEntryTime}>{e.time}</span>
              </div>
              <div className={styles.journalEntryText}>{e.text}</div>
            </div>
          </div>
        ))}
      </div>
      <BottomTabs active="Journal" />
    </div>
  );
}

export function FriendsScreen() {
  const pending = ['OwlBrook992', 'MapleGhost55'];
  const friends = ['CalmMeadow4681', 'CedarBrook', 'EmberMoth', 'SilverFern22'];
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Chat" />
      <div className={styles.screenBody}>
        <div className={styles.segmented}>
          <span>Messages</span>
          <strong>Friends</strong>
        </div>
        <div className={styles.searchMock}><Search size={15} /> Find a friend by username</div>
        <p className={styles.listLabel}>Requests ({pending.length})</p>
        {pending.map((name) => (
          <div className={styles.friendRow} key={name}>
            <span>{name.slice(0, 2).toUpperCase()}</span>
            <div className={styles.friendInfo}>
              <strong>{name}</strong>
              <small>Wants to connect</small>
            </div>
            <button className={styles.acceptBtn}>Accept</button>
          </div>
        ))}
        <p className={styles.listLabel}>Friends ({friends.length})</p>
        {friends.map((name, i) => (
          <div className={styles.friendRow} key={name}>
            <span>{name.slice(0, 2).toUpperCase()}</span>
            <div className={styles.friendInfo}>
              <strong>{name}</strong>
              <small>Anonymous user</small>
            </div>
            <div className={styles.trustedToggleWrap}>
              <span className={styles.trustedLabel}>Trusted</span>
              <span className={`${styles.trustedToggle} ${i < 2 ? styles.trustedOn : ''}`}>
                <span className={styles.trustedThumb} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <BottomTabs active="Chat" />
    </div>
  );
}

export function AidOverviewScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Resources" />
      <div className={styles.screenBody}>
        <div className={styles.infoPill}><Lock size={14} /> Search results are context-aware and not stored.</div>
        <div className={styles.mapMock}>
          <span className={styles.mapDot} />
          <span className={styles.mapPin} />
          <small>SafeHaven Women&apos;s Shelter — 0.8 mi</small>
        </div>
        <div className={styles.resourceTabs}>
          <strong>Shelters</strong>
          <span>Legal Aid</span>
          <span>Financial</span>
          <span>Counseling</span>
        </div>
        {/* Selected card with AI overview */}
        <div className={`${styles.resourceCard} ${styles.aidCardSelected}`}>
          <strong>SafeHaven Women&apos;s Shelter</strong>
          <small className={styles.aidMeta}>0.8 mi · Open 24 hours</small>
          <p className={styles.aidAddress}>142 Oak Street, Sacramento, CA</p>
          <div className={styles.aidOverviewSection}>
            <span className={styles.aidOverviewBadge}><Bot size={10} /> AI Overview</span>
            <p className={styles.aidOverviewText}>
              Located 0.8 miles away. Provides 24/7 emergency housing and crisis support for domestic violence survivors and their children. Services include safety planning, legal advocacy, on-site counseling, and transitional housing assistance. Walk-ins welcome — all services are confidential.
            </p>
          </div>
          <div>
            <button><Phone size={12} /> Call</button>
            <button><MapPin size={12} /> Directions</button>
          </div>
        </div>
        {/* Non-selected card */}
        <div className={styles.resourceCard}>
          <strong>Hope House Emergency Refuge</strong>
          <small>1.4 mi · Open until 9 PM</small>
        </div>
      </div>
      <BottomTabs active="Aid" />
    </div>
  );
}

export function AidScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Resources" />
      <div className={styles.screenBody}>
        <div className={styles.infoPill}><Lock size={14} /> Search results are context-aware and not stored.</div>
        <div className={styles.mapMock}>
          <span className={styles.mapDot} />
          <span className={styles.mapPin} />
          <small>Showing resources near you</small>
        </div>
        <div className={styles.resourceTabs}><strong>Shelters</strong><span>Legal Aid</span><span>Financial</span><span>Counseling</span></div>
        <div className={styles.resourceCard}>
          <strong>Opportunity House Homeless Shelter</strong>
          <small>16 mi away</small>
          <p>267 Bennett Hill Ct, Vacaville, California</p>
          <div><button>Call</button><button>Directions</button></div>
        </div>
      </div>
      <BottomTabs active="Aid" />
    </div>
  );
}
