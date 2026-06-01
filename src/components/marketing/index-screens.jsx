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
} from 'lucide-react';
import { HistoryIcon, SciToggleIcon, BackspaceIcon, HeartIcon, ClockIcon } from './index-icons';
import { StatusBar, AppHeader, BottomTabs } from './index-phone';
import styles from '../../styles/marketing/marketing.module.css';

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
