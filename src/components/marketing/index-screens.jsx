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
