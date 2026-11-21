/**
 * CYBERFORT CTF 2026 — Master Challenge Bank
 * 24 Comprehensive, Distinct, Realistic Cybersecurity Forensics Environments
 * Covering all 12 requested categories + realistic variants.
 */

export interface ClueInternal {
  id: string;
  name: string;
  text: string;
  evidenceSnippet: string;
  locationLabel: string;
  position: string;
  iconType: string;
}

export interface BackgroundNodeInternal {
  id: string;
  name: string;
  text: string;
  position: string;
  iconType: string;
}

export interface ChallengeInternal {
  id: string;
  title: string;
  venueLabel: string;
  environmentTheme: string;
  incidentNarrative: string;
  themeStyle: {
    accentColor: 'cyan' | 'emerald' | 'violet' | 'teal';
    glowColor: string;
    hudTag: string;
    bgHue?: string;
  };
  status: 'published' | 'draft';
  clues: Record<string, ClueInternal>;
  backgroundNodes: Record<string, BackgroundNodeInternal>;
  distractors: string[];
  options: string[];
  hints: string[];
  secretKey: {
    commonLocationPhrase: string;
    flag: string;
  };
  createdAt: number;
}

export const STANDARD_PROGRESSIVE_HINTS: string[] = [
  'Review all three evidence records carefully. Pay attention to the information that appears in more than one record.',
  'Compare the metadata fields across the incident records. One category contains a repeated identifier.',
  'The repeated identifier is relevant to the final flag. Preserve its wording and replace spaces with underscores when formatting your submission.'
];

export const CHALLENGE_BANK: ChallengeInternal[] = [
  // 1. Cybersecurity Operations Centre (SOC)
  {
    id: 'ch_soc_01',
    title: 'OPERATION SHADOW HUNT: CYBERSECURITY OPERATIONS CENTRE',
    venueLabel: 'CYBERFORT — SOC COMMAND — SECTOR 3',
    environmentTheme: 'Cybersecurity Operations Centre',
    incidentNarrative: 'A suspicious lateral movement alert was triggered during night-shift monitoring. Correlate SIEM telemetry, CCTV telemetry, and badge access logs to identify the compromised terminal zone.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(0, 242, 254, 0.35)',
      hudTag: 'SOC_LIVE_FEED_SEC3',
      bgHue: 'hue-rotate-[195deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'SIEM Threat Analysis Workstation',
        text: 'The primary SIEM ingestion pipeline traces an encrypted C2 beacon originating from terminal zone SOC BAY 3.',
        evidenceSnippet: 'SIEM_LOG: #8819-A | HOST: SOC-WS-03 | INCIDENT_LOC: SOC BAY 3 | PROTOCOL: TLS_EXFIL | STATUS: ACTIVE',
        locationLabel: 'Threat Workstation',
        position: 'top-[44%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'SOC Panoramic Wall Display',
        text: 'Overhead optical feed CH-03 recorded an unbadged operative retrieving telemetry logs directly from SOC BAY 3.',
        evidenceSnippet: 'VIDEO_META: CAM-SOC-WALL | TIMESTAMP: 02:14:09 UTC | TARGET_PERIMETER: SOC BAY 3 | EVENT: DRIVE_ATTACHED',
        locationLabel: 'Wall Feed Monitor',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'SOC Entry Turnstile Scanner',
        text: 'The perimeter access terminal records contractor badge RFID-7711 passing through threshold barrier SOC BAY 3.',
        evidenceSnippet: 'ACCESS_AUDIT: GATE-03 | RFID: KEY-7711 | ASSIGNED_ZONE: SOC BAY 3 | CLEARANCE: RESTRICTED',
        locationLabel: 'Turnstile Terminal',
        position: 'top-[42%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: '100G Backbone Telemetry Rack',
        text: 'Optical throughput nominal at 94.2 Gbps. Threat intelligence feeds synced.',
        position: 'top-[22%] left-[46%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Tamper-Evident Evidence Safe',
        text: 'Faraday-shielded enclosure holding seized volatile RAM image drives.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Tactical Playbook Repository',
        text: 'Incident response checklists for APT credential harvesting.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['SOC BAY 1', 'NOC BAY 4', 'SERVER VAULT 2'],
    options: ['SOC BAY 3', 'SOC BAY 1', 'NOC BAY 4', 'SERVER VAULT 2'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'SOC BAY 3',
      flag: 'CYBERFORT{SOC_BAY_3}'
    },
    createdAt: 1772418000000
  },

  // 2. Digital Forensics Laboratory
  {
    id: 'ch_forensic_02',
    title: 'OPERATION SHADOW HUNT: DIGITAL FORENSICS LABORATORY',
    venueLabel: 'CYBERFORT — DIGITAL FORENSICS — LAB 2',
    environmentTheme: 'Digital Forensics Laboratory',
    incidentNarrative: 'An offline forensic disk image revealed hidden steganographic payload extraction. Trace the custody logs to locate the forensic workstation that performed the artifact clone.',
    themeStyle: {
      accentColor: 'emerald',
      glowColor: 'rgba(0, 200, 83, 0.35)',
      hudTag: 'FORENSIC_TRIAGE_CORE',
      bgHue: 'hue-rotate-[110deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'FTK Forensic Write-Blocker Station',
        text: 'The Tableau write-blocker image log verifies that disk imaging was executed inside room LAB 2.',
        evidenceSnippet: 'FTK_DUMP: #4401-B | IMAGER: TABLEAU-SATA3 | DISK_LOCATION: LAB 2 | MD5_VERIFIED: MATCH',
        locationLabel: 'Imaging Console',
        position: 'top-[38%] left-[20%]',
        iconType: 'harddrive'
      },
      cctv: {
        id: 'cctv',
        name: 'Evidence Cleanroom Camera CAM-02',
        text: 'Surveillance recording confirms forensic evidence transfer took place at work station LAB 2.',
        evidenceSnippet: 'CAM_FEED: CLEANROOM-02 | UTC: 03:22:15 | ROOM_TAG: LAB 2 | MOTION_DETECTED: TRUE',
        locationLabel: 'Cleanroom Camera',
        position: 'top-[14%] right-[30%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Faraday Airlock Keypad',
        text: 'Electrostatic airlock log records biometric override granted exclusively for ingress into LAB 2.',
        evidenceSnippet: 'AIRLOCK_LOG: AL-02 | BIOMETRIC_ID: BIO-889 | DESTINATION: LAB 2 | STATUS: OVERRIDE_GRANTED',
        locationLabel: 'Airlock Console',
        position: 'top-[50%] right-[10%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Degausser Eradication Hub',
        text: 'Garner pulse degausser ready. Magnetic calibration within safety parameters.',
        position: 'top-[24%] left-[40%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Cryogenic Evidence Locker',
        text: 'Temperature maintained at -20°C for semiconductor retention analysis.',
        position: 'bottom-[14%] left-[14%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Chain of Custody Archive',
        text: 'NIST SP 800-86 standard forms and transfer receipts ledger.',
        position: 'bottom-[10%] right-[28%]',
        iconType: 'file'
      }
    },
    distractors: ['LAB 1', 'CLEANROOM 4', 'VAULT 5'],
    options: ['LAB 2', 'LAB 1', 'CLEANROOM 4', 'VAULT 5'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'LAB 2',
      flag: 'CYBERFORT{LAB_2}'
    },
    createdAt: 1772418000000
  },

  // 3. Network Monitoring Room
  {
    id: 'ch_netmon_03',
    title: 'OPERATION SHADOW HUNT: NETWORK MONITORING ROOM',
    venueLabel: 'CYBERFORT — NETWORK MONITORING — ZONE 9',
    environmentTheme: 'Network Monitoring Room',
    incidentNarrative: 'An unidentified promiscuous hardware tap was detected injecting forged ARP packets across high-bandwidth fiber rings. Correlate probe alerts to pin down the intrusion zone.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      hudTag: 'NETMON_FABRIC_ZONE9',
      bgHue: 'hue-rotate-[170deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Wireshark Packet Tap Console',
        text: 'Promiscuous packet capture dump confirms unauthorized ARP spoofing occurring directly on segment ZONE 9.',
        evidenceSnippet: 'PCAP_MONITOR: ETH0_SPAN | PROBE_ID: SNIFF-Z9 | LOCAL_HUB: ZONE 9 | EVENT: ARP_POISONING',
        locationLabel: 'Sniffer Console',
        position: 'top-[46%] left-[30%]',
        iconType: 'wifi'
      },
      cctv: {
        id: 'cctv',
        name: 'Fiber Conduit Cam CH-09',
        text: 'Optical fiber trench camera records rogue mini-switch wired directly onto distribution panel ZONE 9.',
        evidenceSnippet: 'OPTICAL_FEED: CH-09-FIBER | TIMESTAMP: 01:54:11 UTC | ZONE_TAG: ZONE 9 | HARDWARE: ROGUE_TAP',
        locationLabel: 'Trench Surveillance',
        position: 'top-[18%] right-[20%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Sub-floor Wireway Barrier',
        text: 'Sub-floor wireway interlock tripped by technician credential logged entering infrastructure ZONE 9.',
        evidenceSnippet: 'INTERLOCK_AUDIT: SUB-09 | SENSOR: MAGNETIC_TRAY | SECTOR: ZONE 9 | STATE: BREACHED',
        locationLabel: 'Wireway Interlock',
        position: 'top-[40%] right-[6%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'DWDM Optical Multiplexer',
        text: 'Dense Wavelength Division Multiplexing link status: 32 channels active.',
        position: 'top-[20%] left-[50%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'OTDR Reflectometer Test Kit',
        text: 'Optical Time-Domain Reflectometer calibrated for single-mode fiber traces.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'VLAN Topology Schematics',
        text: 'Layer-2 switching matrix and IEEE 802.1Q trunk mappings.',
        position: 'bottom-[8%] right-[34%]',
        iconType: 'file'
      }
    },
    distractors: ['ZONE 2', 'NOC BAY 4', 'ZONE 7'],
    options: ['ZONE 9', 'ZONE 2', 'NOC BAY 4', 'ZONE 7'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'ZONE 9',
      flag: 'CYBERFORT{ZONE_9}'
    },
    createdAt: 1772418000000
  },

  // 4. Secure Server Facility
  {
    id: 'ch_server_04',
    title: 'OPERATION SHADOW HUNT: SECURE SERVER FACILITY',
    venueLabel: 'CYBERFORT — HIGH-SECURITY SERVERS — VAULT DELTA',
    environmentTheme: 'Secure Server Facility',
    incidentNarrative: 'Chassis tamper sensors logged an unauthorized open event on cold-storage blade servers. Inspect physical and remote out-of-band telemetry to locate the target vault.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(168, 85, 247, 0.35)',
      hudTag: 'VAULT_DELTA_SEALED',
      bgHue: 'hue-rotate-[255deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Out-of-Band IPMI Terminal',
        text: 'BMC firmware intrusion alert records chassis latch popped open on server blade inside VAULT DELTA.',
        evidenceSnippet: 'IPMI_ALARM: #9102-C | BMC_HOST: BLADE-VD-04 | ASSET_LOCATION: VAULT DELTA | EVENT: COVER_REMOVED',
        locationLabel: 'IPMI Management Unit',
        position: 'top-[42%] left-[24%]',
        iconType: 'server'
      },
      cctv: {
        id: 'cctv',
        name: 'Cold Aisle Ceiling Camera',
        text: 'Surveillance camera confirms an unauthorized physical intervention inside heavy containment VAULT DELTA.',
        evidenceSnippet: 'VIDEO_DUMP: CH-DELTA-01 | TIME: 03:09:44 UTC | ZONE: VAULT DELTA | ANOMALY: FLASH_DRIVE_SEEDED',
        locationLabel: 'Cold Aisle Surveillance',
        position: 'top-[16%] right-[26%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Pressure-Sealed Vault Door',
        text: 'Electronic hydraulic door lock recorded mechanical bypass lever pulled at entryway VAULT DELTA.',
        evidenceSnippet: 'VAULT_GATE: HYDRAULIC-04 | SENSOR: PRESSURE_BOLT | ROOM_ID: VAULT DELTA | STATUS: MANUAL_RELEASE',
        locationLabel: 'Vault Door Panel',
        position: 'top-[46%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Inergen Fire Suppression Manifold',
        text: 'Gas suppression cylinders pressurized at 300 bar. Smoke aspirators clear.',
        position: 'top-[22%] left-[45%]',
        iconType: 'shield'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Faraday Backup Cart',
        text: 'Sealed stainless steel transport case for off-site backup tapes.',
        position: 'bottom-[14%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Server Rack Cabling Blueprint',
        text: 'Dual-redundant 48V DC power bus and hot-aisle containment blueprints.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['VAULT ALPHA', 'VAULT BETA', 'VAULT GAMMA'],
    options: ['VAULT DELTA', 'VAULT ALPHA', 'VAULT BETA', 'VAULT GAMMA'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'VAULT DELTA',
      flag: 'CYBERFORT{VAULT_DELTA}'
    },
    createdAt: 1772418000000
  },

  // 5. Cloud Security Command Centre
  {
    id: 'ch_cloud_05',
    title: 'OPERATION SHADOW HUNT: CLOUD SECURITY COMMAND CENTRE',
    venueLabel: 'CYBERFORT — CLOUD SECURITY — CLOUD POD 6',
    environmentTheme: 'Cloud Security Command Centre',
    incidentNarrative: 'Container escape exploit resulted in host-level root execution inside an isolated hypervisor enclave. Correlate kernel audit logs to identify the compromised compute pod.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      hudTag: 'CLOUD_HYPERVISOR_CLUSTER',
      bgHue: 'hue-rotate-[185deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Kubernetes Telemetry Console',
        text: 'Audit daemon flags kernel ring buffer breach and namespace breakout pinpointed at CLOUD POD 6.',
        evidenceSnippet: 'KUBE_AUDIT: POD-ESCAPE-91 | NODE_ID: WORKER-CP-06 | CLUSTER_ZONE: CLOUD POD 6 | PRIVILEGE: ROOT_ESCALATION',
        locationLabel: 'Cluster Controller',
        position: 'top-[40%] left-[22%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Modular Enclosure Camera 6',
        text: 'Containment surveillance shows diagnostic laptop plugged into top-of-rack leaf switch in CLOUD POD 6.',
        evidenceSnippet: 'SURVEILLANCE: CAM-MOD-6 | TIME: 02:44:19 UTC | ENCLOSURE: CLOUD POD 6 | EVENT: RJ45_INJECTION',
        locationLabel: 'Pod Camera',
        position: 'top-[15%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Modular Pod Biometric Gate',
        text: 'Access control unit records cloud engineer card swipe into hypervisor row CLOUD POD 6.',
        evidenceSnippet: 'GATEWAY_LOG: POD-SWIPE-06 | RFID: USER-772 | COMPUTE_BAY: CLOUD POD 6 | AUTH: VALIDATED',
        locationLabel: 'Pod Turnstile',
        position: 'top-[44%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: '400G Leaf-Spine Switch Fabric',
        text: 'BGP EVPN fabric operating with zero packet loss across spine links.',
        position: 'top-[22%] left-[48%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Hardware Security Module Rack',
        text: 'FIPS 140-3 Level 4 HSM verifying root certificate authority keys.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Terraform Infrastructure Plans',
        text: 'Declarative VPC routing table and security group manifests.',
        position: 'bottom-[10%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['CLOUD POD 1', 'CLOUD POD 3', 'CLOUD POD 8'],
    options: ['CLOUD POD 6', 'CLOUD POD 1', 'CLOUD POD 3', 'CLOUD POD 8'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'CLOUD POD 6',
      flag: 'CYBERFORT{CLOUD_POD_6}'
    },
    createdAt: 1772418000000
  },

  // 6. Access-Control Investigation Room
  {
    id: 'ch_access_06',
    title: 'OPERATION SHADOW HUNT: ACCESS-CONTROL INVESTIGATION ROOM',
    venueLabel: 'CYBERFORT — PHYSICAL SECURITY — GATE SECTOR 8',
    environmentTheme: 'Access-Control Investigation Room',
    incidentNarrative: 'A cloned high-frequency RFID badge was used to defeat anti-passback controls. Cross-examine perimeter telemetry to discover the breached physical checkpoint.',
    themeStyle: {
      accentColor: 'emerald',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      hudTag: 'ACCESS_BARRIER_SEC8',
      bgHue: 'hue-rotate-[130deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Badge Controller Diagnostic Kiosk',
        text: 'Access server database flags double-badge anomaly registered simultaneously at GATE SECTOR 8.',
        evidenceSnippet: 'RFID_SYS: AMAG-CTRL-08 | CARD_ID: CLONED-881 | CHECKPOINT: GATE SECTOR 8 | VIOLATION: ANTI_PASSBACK',
        locationLabel: 'Badge Management Kiosk',
        position: 'top-[42%] left-[28%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Checkpoint Overhead Camera 08',
        text: 'High-speed optical camera captured tailgating incident at turnstile barrier GATE SECTOR 8.',
        evidenceSnippet: 'VIDEO_CAM: PTZ-GATE-08 | TIMESTAMP: 03:31:02 UTC | LOCATION: GATE SECTOR 8 | EVENT: TAILGATE_BREACH',
        locationLabel: 'Turnstile Video Feed',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Biometric Iris Scanner Terminal',
        text: 'Facial recognition scanner report logged an unverified entry attempt at portal GATE SECTOR 8.',
        evidenceSnippet: 'BIOMETRIC_LOG: IRIS-SCAN-08 | ZONE_ID: GATE SECTOR 8 | REASON: CREDENTIAL_MISMATCH | TIME: 03:30:58',
        locationLabel: 'Iris Scanner Unit',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Intercom Master Station',
        text: 'Duress signal monitor active. All secondary gates on lockdown standby.',
        position: 'top-[22%] left-[46%]',
        iconType: 'shield'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Seized RFID Cloner Enclosure',
        text: 'Proxmark3 RDV4 device recovered from physical premises.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Perimeter Boundary Ledger',
        text: 'Turnstile mechanical override keys and custodian records.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['GATE SECTOR 2', 'GATE SECTOR 4', 'GATE SECTOR 9'],
    options: ['GATE SECTOR 8', 'GATE SECTOR 2', 'GATE SECTOR 4', 'GATE SECTOR 9'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'GATE SECTOR 8',
      flag: 'CYBERFORT{GATE_SECTOR_8}'
    },
    createdAt: 1772418000000
  },

  // 7. Incident Response Centre
  {
    id: 'ch_ir_07',
    title: 'OPERATION SHADOW HUNT: INCIDENT RESPONSE CENTRE',
    venueLabel: 'CYBERFORT — CRISIS RESPONSE — SECTOR ALPHA 1',
    environmentTheme: 'Incident Response Centre',
    incidentNarrative: 'An automated ransomware canary file was modified on an engineering share. Triage the war-room investigation evidence to determine the originating incident sector.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(147, 51, 234, 0.35)',
      hudTag: 'INCIDENT_RESPONSE_ALPHA',
      bgHue: 'hue-rotate-[270deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'IR War Room Triage Station',
        text: 'Endpoint Detection and Response (EDR) agent isolated malicious encryption process in SECTOR ALPHA 1.',
        evidenceSnippet: 'EDR_ALERT: CROWD-ISOLATE | PROCESS: SHADOW_ENC.EXE | HOST_ROOM: SECTOR ALPHA 1 | ISOLATED: TRUE',
        locationLabel: 'Triage Workstation',
        position: 'top-[44%] left-[25%]',
        iconType: 'shield'
      },
      cctv: {
        id: 'cctv',
        name: 'Tactical Ceiling Dome Camera',
        text: 'Security feed logs urgent technician intervention at terminal bank SECTOR ALPHA 1.',
        evidenceSnippet: 'CAM_FEED: WAR-DOME-1 | TIMESTAMP: 04:12:18 UTC | SECTOR_TAG: SECTOR ALPHA 1 | STATUS: HOT_SWAP',
        locationLabel: 'Tactical Dome Cam',
        position: 'top-[15%] right-[25%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Containment Airlock Terminal',
        text: 'Emergency containment interlock seal active, locking ingress into emergency zone SECTOR ALPHA 1.',
        evidenceSnippet: 'EMERGENCY_LOCK: ZONE-A1 | COMMAND: AUTOMATED_CONTAINMENT | ROOM_TARGET: SECTOR ALPHA 1',
        locationLabel: 'Containment Seal Panel',
        position: 'top-[48%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Airgap Network Bridge',
        text: 'Physical network bridge severed. Enclave currently operating in offline quarantine.',
        position: 'top-[22%] left-[45%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Emergency Backup Drive Cart',
        text: 'Immutable write-once-read-many (WORM) tape media storage box.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Crisis Escalation Binder',
        text: 'C-suite notification protocols and legal forensics chain logs.',
        position: 'bottom-[10%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['SECTOR ALPHA 3', 'SECTOR BETA 2', 'NOC VAULT 1'],
    options: ['SECTOR ALPHA 1', 'SECTOR ALPHA 3', 'SECTOR BETA 2', 'NOC VAULT 1'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'SECTOR ALPHA 1',
      flag: 'CYBERFORT{SECTOR_ALPHA_1}'
    },
    createdAt: 1772418000000
  },

  // 8. Threat Intelligence Laboratory
  {
    id: 'ch_threat_08',
    title: 'OPERATION SHADOW HUNT: THREAT INTELLIGENCE LABORATORY',
    venueLabel: 'CYBERFORT — THREAT INTEL — INTEL BAY 5',
    environmentTheme: 'Threat Intelligence Laboratory',
    incidentNarrative: 'An advanced persistent threat (APT) actor targeted cryptographic HSM firmware. Analyze reverse-engineering telemetry to locate the target research bay.',
    themeStyle: {
      accentColor: 'teal',
      glowColor: 'rgba(13, 148, 136, 0.35)',
      hudTag: 'THREAT_INTEL_HIVE',
      bgHue: 'hue-rotate-[160deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Ghidra Decompiler Workstation',
        text: 'Reverse engineering analysis matches disassembled binary dropper targeted at lab cluster INTEL BAY 5.',
        evidenceSnippet: 'GHIDRA_LOG: BIN_ANALYSIS_77 | TARGET_PLATFORM: INTEL BAY 5 | SHA256: e3b0c442... | CLUSTER: ACTIVE',
        locationLabel: 'Decompiler Terminal',
        position: 'top-[42%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Research Wing PTZ Camera',
        text: 'Camera tracking feed records suspicious hardware analyzer connected in INTEL BAY 5.',
        evidenceSnippet: 'CCTV_PTZ: INTEL-WING-05 | TIME: 03:45:10 UTC | TARGET_ZONE: INTEL BAY 5 | EVENT: LOGIC_ANALYZER',
        locationLabel: 'PTZ Surveillance',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Threat Vault Smart Door',
        text: 'High-security cipher door scan logs clearance granted specifically for research chamber INTEL BAY 5.',
        evidenceSnippet: 'CIPHER_DOOR: LOCK-IB5 | BADGE: INTEL-SPEC-09 | PERMITTED_ROOM: INTEL BAY 5 | STATUS: ACCESSED',
        locationLabel: 'Smart Door Panel',
        position: 'top-[46%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Threat Feed Aggregator Hub',
        text: 'MITRE ATT&CK enterprise matrix mapped against incoming IOCs.',
        position: 'top-[22%] left-[48%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Malware Detonation Sandbox',
        text: 'Isolated bare-metal hypervisor configured for volatile zero-day execution.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'APT Threat Dossiers',
        text: 'Classified threat actor profiling reports and infrastructure footprints.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['INTEL BAY 1', 'INTEL BAY 3', 'CYBER VAULT 9'],
    options: ['INTEL BAY 5', 'INTEL BAY 1', 'INTEL BAY 3', 'CYBER VAULT 9'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'INTEL BAY 5',
      flag: 'CYBERFORT{INTEL_BAY_5}'
    },
    createdAt: 1772418000000
  },

  // 9. Digital Evidence Recovery Chamber
  {
    id: 'ch_archive_09',
    title: 'OPERATION SHADOW HUNT: DIGITAL EVIDENCE RECOVERY CHAMBER',
    venueLabel: 'CYBERFORT — EVIDENCE VAULT — ARCHIVE OMEGA 2',
    environmentTheme: 'Digital Evidence Recovery Chamber',
    incidentNarrative: 'Chain of custody anomaly detected on a sealed magnetic evidence container. Cross-reference vault ledger entries to identify the specific storage repository.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(34, 211, 238, 0.35)',
      hudTag: 'EVIDENCE_ARCHIVE_OMEGA',
      bgHue: 'hue-rotate-[205deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Evidence Ledger Master Console',
        text: 'Inventory tracking software alerts on missing custody seal registered in ARCHIVE OMEGA 2.',
        evidenceSnippet: 'INVENTORY_ALERT: #EV-7721 | CONTAINER_TAG: ARCHIVE OMEGA 2 | CUSTODY_STATE: TAMPERED',
        locationLabel: 'Ledger Terminal',
        position: 'top-[44%] left-[24%]',
        iconType: 'harddrive'
      },
      cctv: {
        id: 'cctv',
        name: 'Laser Barrier Perimeter Camera',
        text: 'Infrared tripwire beam recorded an unauthorized presence crossing threshold ARCHIVE OMEGA 2.',
        evidenceSnippet: 'OPTICAL_BEAM: IR-OMEGA-02 | CAMERA: CAM-VAULT-2 | SECTOR: ARCHIVE OMEGA 2 | STATUS: TRIP_RECORDED',
        locationLabel: 'Laser Perimeter Cam',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Dual-Custody Vault Wheel Terminal',
        text: 'Mechanical locking ledger flags emergency wheel turn recorded at safe ARCHIVE OMEGA 2.',
        evidenceSnippet: 'VAULT_WHEEL: OMEGA-02 | DUAL_KEY_STATUS: OVERRIDE | ASSIGNED_ZONE: ARCHIVE OMEGA 2',
        locationLabel: 'Vault Lock Terminal',
        position: 'top-[44%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Digital Evidence Safe Enclosure',
        text: 'Reinforced biometric locker holding solid-state seized drives.',
        position: 'top-[22%] left-[46%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Media Degausser Chamber',
        text: 'Electromagnetic coil ready for secure sanitization.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Legal Court Docket Archive',
        text: 'Federal rules of evidence compliance documents.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['ARCHIVE OMEGA 1', 'ARCHIVE BETA 4', 'EVIDENCE VAULT 7'],
    options: ['ARCHIVE OMEGA 2', 'ARCHIVE OMEGA 1', 'ARCHIVE BETA 4', 'EVIDENCE VAULT 7'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'ARCHIVE OMEGA 2',
      flag: 'CYBERFORT{ARCHIVE_OMEGA_2}'
    },
    createdAt: 1772418000000
  },

  // 10. Suspicious Login Investigation Room
  {
    id: 'ch_login_10',
    title: 'OPERATION SHADOW HUNT: SUSPICIOUS LOGIN INVESTIGATION ROOM',
    venueLabel: 'CYBERFORT — IDENTITY DEFENSE — SUITE SIGMA 7',
    environmentTheme: 'Suspicious Login Investigation Room',
    incidentNarrative: 'An anomalous concurrent login was detected from two geographically impossible IP addresses within 30 seconds. Correlate identity logs to pinpoint the breached terminal suite.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(192, 132, 252, 0.35)',
      hudTag: 'IDENTITY_DEFENSE_SIGMA',
      bgHue: 'hue-rotate-[280deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Active Directory Identity Terminal',
        text: 'Kerberos ticket granting service flagged golden ticket forgery originating from SUITE SIGMA 7.',
        evidenceSnippet: 'KERBEROS_AUDIT: EVENT-4769 | DOMAIN: CYBERFORT.EDU | TICKET_CLIENT: SUITE SIGMA 7 | STATUS: FORGED_MAC',
        locationLabel: 'Identity Console',
        position: 'top-[42%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Conference Suite Cam 07',
        text: 'Overhead camera recorded a rogue laptop plugged directly into the IP telephony bridge in SUITE SIGMA 7.',
        evidenceSnippet: 'CAM_FEED: CH-SIGMA-07 | TIMESTAMP: 04:02:19 UTC | VENUE: SUITE SIGMA 7 | OBJECT: ROGUE_DONGLE',
        locationLabel: 'Suite Camera',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Executive Floor Badge Reader',
        text: 'Floor turnstile terminal recorded anomalous badge cloned access swipe targeting door SUITE SIGMA 7.',
        evidenceSnippet: 'GATE_SCAN: TS-SIGMA | BADGE: EXEC-9011 | TARGET_DOOR: SUITE SIGMA 7 | RESULT: MULTI_ACCESS_ALERT',
        locationLabel: 'Floor Badge Unit',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'MFA Radius Server Unit',
        text: 'FIDO2 WebAuthn token authentication validator running version 4.2.1.',
        position: 'top-[22%] left-[48%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'YubiKey Hardware Repository',
        text: 'NFC physical security key vault for domain administrators.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Zero-Trust Policy Ledger',
        text: 'Conditional access rules and session lifetime constraints.',
        position: 'bottom-[8%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['SUITE SIGMA 1', 'SUITE ALPHA 4', 'NOC ROOM 3'],
    options: ['SUITE SIGMA 7', 'SUITE SIGMA 1', 'SUITE ALPHA 4', 'NOC ROOM 3'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'SUITE SIGMA 7',
      flag: 'CYBERFORT{SUITE_SIGMA_7}'
    },
    createdAt: 1772418000000
  },

  // 11. Network Operations Laboratory
  {
    id: 'ch_netops_11',
    title: 'OPERATION SHADOW HUNT: NETWORK OPERATIONS LABORATORY',
    venueLabel: 'CYBERFORT — INFRASTRUCTURE LAB — RACK ECHO 12',
    environmentTheme: 'Network Operations Laboratory',
    incidentNarrative: 'A rogue wireless drop-box was identified hopping internal management VLANs. Analyze spectrum captures and rack telemetry to localize the physical installation.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(14, 165, 233, 0.35)',
      hudTag: 'NETOPS_INFRA_ECHO',
      bgHue: 'hue-rotate-[190deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Spectrum Analyzer Terminal',
        text: 'RF spectrum scanner confirms 2.4/5GHz rogue SSID transmitter broadcasting from RACK ECHO 12.',
        evidenceSnippet: 'RF_SCANNER: #SPEC-991 | BSSID: D4:6E:0E:9A:12 | PHYSICAL_BAY: RACK ECHO 12 | SIGNAL: -42_DBM',
        locationLabel: 'Spectrum Console',
        position: 'top-[44%] left-[28%]',
        iconType: 'wifi'
      },
      cctv: {
        id: 'cctv',
        name: 'Aisle Surveillance Cam 12',
        text: 'Security feed logs magnetic Raspberry Pi unit stuck to the rear vertical cable tray of RACK ECHO 12.',
        evidenceSnippet: 'OPTICAL_FEED: AISLE-ECHO-12 | UTC: 02:29:40 | ASSET_TAG: RACK ECHO 12 | ANOMALY: HARDWARE_PLANTED',
        locationLabel: 'Aisle Cam Feed',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Patch Panel Smart Keypad',
        text: 'Intelligent cabinet lock report confirms unprompted electronic lock disengage on RACK ECHO 12.',
        evidenceSnippet: 'SMART_RACK: LOCK-ECHO-12 | SENSOR: REAR_DOOR | RACK_ID: RACK ECHO 12 | STATUS: SOLENOID_OPEN',
        locationLabel: 'Smart Rack Panel',
        position: 'top-[46%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Core Optical Cross-Connect',
        text: 'High-density MPO-32 ribbon fiber patch enclosure.',
        position: 'top-[22%] left-[46%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Fluke Network Cable Tester',
        text: 'Cat6A certification tool displaying 10GBase-T compliance.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Datacenter Cabling Blueprint',
        text: 'Structured cabling diagrams and intra-rack ladder layout.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['RACK ECHO 04', 'RACK DELTA 09', 'NOC BAY 2'],
    options: ['RACK ECHO 12', 'RACK ECHO 04', 'RACK DELTA 09', 'NOC BAY 2'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'RACK ECHO 12',
      flag: 'CYBERFORT{RACK_ECHO_12}'
    },
    createdAt: 1772418000000
  },

  // 12. Security Surveillance Centre
  {
    id: 'ch_surveillance_12',
    title: 'OPERATION SHADOW HUNT: SECURITY SURVEILLANCE CENTRE',
    venueLabel: 'CYBERFORT — PHYSICAL SECURITY — SURVEILLANCE NODE 10',
    environmentTheme: 'Security Surveillance Centre',
    incidentNarrative: 'CCTV video streams were intercepted via an RTSP credential replay exploit. Isolate the compromised NVR encoding appliance across the facility.',
    themeStyle: {
      accentColor: 'emerald',
      glowColor: 'rgba(5, 150, 105, 0.35)',
      hudTag: 'SURVEILLANCE_HUB_10',
      bgHue: 'hue-rotate-[145deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'NVR Video Encoding Console',
        text: 'RTSP video bridge logs unauthenticated live stream redirection targeted at SURVEILLANCE NODE 10.',
        evidenceSnippet: 'NVR_AUDIT: #RTSP-701 | STREAM_PORT: 8554 | HUB_LOCATION: SURVEILLANCE NODE 10 | EXFIL: ANOMALOUS',
        locationLabel: 'NVR Controller',
        position: 'top-[42%] left-[25%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Video Matrix Wall Display',
        text: 'Main video wall recorded automated looping feed override active on terminal SURVEILLANCE NODE 10.',
        evidenceSnippet: 'SURVEILLANCE_LOG: WALL-FEED-10 | TIME: 03:52:11 UTC | UNIT_TAG: SURVEILLANCE NODE 10 | EVENT: LOOP_DETECTED',
        locationLabel: 'Wall Matrix Cam',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Control Room Security Keycard Scanner',
        text: 'Security console barrier report logged authorization bypass at SURVEILLANCE NODE 10.',
        evidenceSnippet: 'DOOR_LOG: CR-DOOR-10 | SENSOR: MAG_LOCK | CHECKPOINT: SURVEILLANCE NODE 10 | STATUS: BYPASSED',
        locationLabel: 'Console Keypad',
        position: 'top-[44%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'PTZ Joystick Telemetry Matrix',
        text: 'Pan-tilt-zoom camera telemetry controller running on RS-485 bus.',
        position: 'top-[22%] left-[46%]',
        iconType: 'shield'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Video Hard Drive RAID Locker',
        text: '80TB SAS-3 surveillance storage array in RAID-6 configuration.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Camera Perimeter Topology',
        text: 'Building camera blind-spot analysis and coverage heatmaps.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['SURVEILLANCE NODE 02', 'SURVEILLANCE NODE 06', 'GATE SECTOR 5'],
    options: ['SURVEILLANCE NODE 10', 'SURVEILLANCE NODE 02', 'SURVEILLANCE NODE 06', 'GATE SECTOR 5'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'SURVEILLANCE NODE 10',
      flag: 'CYBERFORT{SURVEILLANCE_NODE_10}'
    },
    createdAt: 1772418000000
  },

  // 13. Industrial SCADA Cyber Command
  {
    id: 'ch_scada_13',
    title: 'OPERATION SHADOW HUNT: INDUSTRIAL SCADA CYBER COMMAND',
    venueLabel: 'CYBERFORT — CRITICAL INFRASTRUCTURE — STATION EPSILON 5',
    environmentTheme: 'Industrial SCADA Cyber Command',
    incidentNarrative: 'Modbus TCP packets injected forged register values into a critical turbine cooling loop. Trace telemetry to determine the targeted SCADA station.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(139, 92, 246, 0.35)',
      hudTag: 'SCADA_ICS_EPSILON',
      bgHue: 'hue-rotate-[260deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'PLC Engineering Workstation',
        text: 'Modbus command log confirms unauthorized coil write injection sent directly to STATION EPSILON 5.',
        evidenceSnippet: 'PLC_AUDIT: MODBUS_TCP_502 | TARGET_STATION: STATION EPSILON 5 | REGISTER: 40012 | COMMAND: FORCE_COIL',
        locationLabel: 'Engineering Console',
        position: 'top-[40%] left-[24%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Turbine Floor Camera 05',
        text: 'High-definition industrial camera captures unrecognized diagnostic programmer plugged into STATION EPSILON 5.',
        evidenceSnippet: 'CCTV_ICS: CH-TURBINE-05 | TIME: 04:14:02 UTC | LOCATION: STATION EPSILON 5 | EVENT: ROGUE_PROGRAMMER',
        locationLabel: 'Turbine Camera',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Substation Physical Interlock',
        text: 'Physical safety gate barrier report confirms interlock door manually released at STATION EPSILON 5.',
        evidenceSnippet: 'GATE_RELAY: INTERLOCK-EP5 | LOCATION: STATION EPSILON 5 | SENSOR: TAMPER_TRIPPED',
        locationLabel: 'Interlock Panel',
        position: 'top-[44%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Analog Pressure Telemetry Bank',
        text: 'Bourdon tube gauges and 4-20mA current loop transmitters.',
        position: 'top-[22%] left-[48%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Hardwired Emergency SCRAM Panel',
        text: 'Hardwired safety shutdown circuit independent of software control.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Ladder Logic Documentation',
        text: 'IEC 61131-3 PLC relay ladder diagrams and safety interlocks.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['STATION EPSILON 1', 'STATION DELTA 4', 'TURBINE HALL 2'],
    options: ['STATION EPSILON 5', 'STATION EPSILON 1', 'STATION DELTA 4', 'TURBINE HALL 2'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'STATION EPSILON 5',
      flag: 'CYBERFORT{STATION_EPSILON_5}'
    },
    createdAt: 1772418000000
  },

  // 14. Satellite Comms Ground Station
  {
    id: 'ch_satellite_14',
    title: 'OPERATION SHADOW HUNT: SATELLITE COMMS GROUND STATION',
    venueLabel: 'CYBERFORT — AEROSPACE TELEMETRY — DISH ARRAY 4',
    environmentTheme: 'Satellite Comms Ground Station',
    incidentNarrative: 'An unauthorized uplink frequency override attempted to desynchronize orbital telemetry. Pinpoint the rogue terminal connected to the dish array.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      hudTag: 'SATCOM_UPLINK_ARRAY4',
      bgHue: 'hue-rotate-[175deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Orbital Telemetry Tracking Console',
        text: 'Ephemeris tracking subsystem alerts on spoofed Doppler shift command routed through DISH ARRAY 4.',
        evidenceSnippet: 'SATCOM_LOG: #UPLINK-44 | FREQ: 14.25_GHZ | GROUND_SYSTEM: DISH ARRAY 4 | STATUS: UNAPPROVED_BURST',
        locationLabel: 'Telemetry Console',
        position: 'top-[44%] left-[26%]',
        iconType: 'wifi'
      },
      cctv: {
        id: 'cctv',
        name: 'Dish Gantry Optical Camera',
        text: 'Gantry camera footage records unauthorized calibration tool attached to feed horn of DISH ARRAY 4.',
        evidenceSnippet: 'GANTRY_CAM: FEED-DISH-04 | TIMESTAMP: 01:48:33 UTC | TARGET: DISH ARRAY 4 | EVENT: MOUNT_TAMPER',
        locationLabel: 'Gantry Cam Feed',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Antenna Field Security Turnstile',
        text: 'Perimeter turnstile logs field technician credential swiped at perimeter access point DISH ARRAY 4.',
        evidenceSnippet: 'GATE_ENTRY: SAT-GATE-04 | BADGE: AERO-991 | DESTINATION: DISH ARRAY 4 | CLEARANCE: VALID',
        locationLabel: 'Field Turnstile',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Cryo-Cooled Low Noise Amplifier',
        text: 'LNA noise temperature 35K. Reception signal-to-noise ratio nominal.',
        position: 'top-[22%] left-[46%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Baseband Demodulator Enclosure',
        text: 'QPSK/8PSK demodulator tracking LEO constellation downlink.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Orbital Ephemeris Binder',
        text: 'Two-line element (TLE) orbital vectors and pass schedules.',
        position: 'bottom-[8%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['DISH ARRAY 1', 'DISH ARRAY 2', 'NOC VAULT 8'],
    options: ['DISH ARRAY 4', 'DISH ARRAY 1', 'DISH ARRAY 2', 'NOC VAULT 8'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'DISH ARRAY 4',
      flag: 'CYBERFORT{DISH_ARRAY_4}'
    },
    createdAt: 1772418000000
  },

  // 15. Cryptographic Key Management Enclave
  {
    id: 'ch_crypto_15',
    title: 'OPERATION SHADOW HUNT: CRYPTOGRAPHIC KEY ENCLAVE',
    venueLabel: 'CYBERFORT — KEY CEREMONY VAULT — HSM VAULT 9',
    environmentTheme: 'Cryptographic Key Management Enclave',
    incidentNarrative: 'A side-channel differential power analysis probe was attached to an offline root key signing module. Locate the breached cryptographic enclave.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(168, 85, 247, 0.35)',
      hudTag: 'CRYPTO_HSM_SECTOR9',
      bgHue: 'hue-rotate-[275deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Key Ceremony Workstation',
        text: 'Airgapped Linux workstation logs unexpected USB power draw spike reported inside HSM VAULT 9.',
        evidenceSnippet: 'KEY_AUDIT: CEREMONY_77 | WORKSTATION_TAG: HSM VAULT 9 | BUS_VOLTAGE: SPIKE_DETECTED | ANOMALY: DPA_PROBE',
        locationLabel: 'Ceremony Terminal',
        position: 'top-[42%] left-[24%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Dual-Custody Vault Camera',
        text: 'Overhead camera records dual-custody safe unlocked without secondary keyholder presence in HSM VAULT 9.',
        evidenceSnippet: 'VIDEO_CUSTODY: CAM-HSM-9 | TIME: 03:08:12 UTC | ROOM: HSM VAULT 9 | ALERT: SINGLE_OPERATOR_DETECTED',
        locationLabel: 'Vault Interior Camera',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Biometric Palm Scanner',
        text: 'Perimeter palm vein scanner records authorized officer card badge entry into secure chamber HSM VAULT 9.',
        evidenceSnippet: 'VEIN_SCANNER: PALM-09 | OFFICER_ID: CRYPTO-02 | ROOM: HSM VAULT 9 | VERIFIED: TRUE',
        locationLabel: 'Palm Scanner Panel',
        position: 'top-[46%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Hardware True Random Generator',
        text: 'Radioactive decay / quantum thermal noise entropy source: 100% health.',
        position: 'top-[22%] left-[48%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Shamir Secret Key Shard Safe',
        text: 'Physical smartcards storing 3-of-5 threshold signature fragments.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Root CA Certificate Ledger',
        text: 'Offline Certificate Revocation Lists and root certificate logs.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['HSM VAULT 1', 'HSM VAULT 3', 'SEC-OPS BAY 7'],
    options: ['HSM VAULT 9', 'HSM VAULT 1', 'HSM VAULT 3', 'SEC-OPS BAY 7'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'HSM VAULT 9',
      flag: 'CYBERFORT{HSM_VAULT_9}'
    },
    createdAt: 1772418000000
  },

  // 16. Autonomous Systems Defense Lab
  {
    id: 'ch_auto_16',
    title: 'OPERATION SHADOW HUNT: AUTONOMOUS SYSTEMS DEFENSE LAB',
    venueLabel: 'CYBERFORT — ROBOTICS & DRONES — TESTBED ZETA 3',
    environmentTheme: 'Autonomous Systems Defense Lab',
    incidentNarrative: 'An adversary broadcast malicious MAVLink GPS spoofing packets to commandeer a perimeter defense drone. Isolate the target testbed facility.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(34, 211, 238, 0.35)',
      hudTag: 'AUTONOMOUS_TESTBED_ZETA',
      bgHue: 'hue-rotate-[195deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Drone Ground Control Station',
        text: 'Flight telemetry logs show fake RTK GPS coordinates injected into drone docking bay TESTBED ZETA 3.',
        evidenceSnippet: 'MAVLINK_AUDIT: #DRONE-88 | PROTOCOL: GPS_RAW_INT | DOCK_ZONE: TESTBED ZETA 3 | SPOOF_CONFIRMED: YES',
        locationLabel: 'Ground Control Unit',
        position: 'top-[44%] left-[25%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Flight Cage Optical Tracker',
        text: 'Optical flight cage sensor recorded unauthorized SDR device emitting rogue 433MHz signals at TESTBED ZETA 3.',
        evidenceSnippet: 'OPTICAL_TRACKER: CAGE-CAM-Z3 | TIMESTAMP: 02:49:15 UTC | VENUE: TESTBED ZETA 3 | DETECTION: ROGUE_SDR',
        locationLabel: 'Cage Tracker Cam',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Safety Interlock Blast Gate',
        text: 'Flight testing barrier gate log confirms manual safety latch opened at enclosure TESTBED ZETA 3.',
        evidenceSnippet: 'GATEWAY_LOG: BLAST-GATE-Z3 | SENSOR: MAGNETIC_BOLT | ROOM: TESTBED ZETA 3 | RESULT: MANUALLY_TRIPPED',
        locationLabel: 'Safety Gate Keypad',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'RF Jammer Defense Matrix',
        text: 'Anti-drone directional radio jammer armed on 2.4GHz / 5.8GHz bands.',
        position: 'top-[22%] left-[46%]',
        iconType: 'wifi'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'LiPo Battery Safety Cabinet',
        text: 'Flame-proof battery storage unit monitored at 21.0°C.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Autopilot Firmware Archive',
        text: 'PX4 and ArduPilot signed binary images and source checksums.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['TESTBED ZETA 1', 'TESTBED ALPHA 4', 'HANGAR 7'],
    options: ['TESTBED ZETA 3', 'TESTBED ZETA 1', 'TESTBED ALPHA 4', 'HANGAR 7'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'TESTBED ZETA 3',
      flag: 'CYBERFORT{TESTBED_ZETA_3}'
    },
    createdAt: 1772418000000
  },

  // 17. Zero-Trust Telemetry Hub
  {
    id: 'ch_zerotrust_17',
    title: 'OPERATION SHADOW HUNT: ZERO-TRUST TELEMETRY HUB',
    venueLabel: 'CYBERFORT — EDGE PROXY CORRIDOR — PROXY CLUSTER 11',
    environmentTheme: 'Zero-Trust Telemetry Hub',
    incidentNarrative: 'Mutual TLS (mTLS) client certificate private keys were extracted from an edge proxy node. Locate the compromised cluster corridor.',
    themeStyle: {
      accentColor: 'teal',
      glowColor: 'rgba(20, 184, 166, 0.35)',
      hudTag: 'ZERO_TRUST_GATEWAY_11',
      bgHue: 'hue-rotate-[165deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Envoy Edge Proxy Terminal',
        text: 'Envoy access log reports TLS handshake termination failure and stolen client cert at PROXY CLUSTER 11.',
        evidenceSnippet: 'ENVOY_ACCESS: mTLS_HANDSHAKE_FAIL | PROXY_INSTANCE: PROXY CLUSTER 11 | CLIENT_CERT: EXPIRED_OR_STOLEN',
        locationLabel: 'Envoy Console',
        position: 'top-[42%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Proxy Corridor Camera CAM-11',
        text: 'Corridor surveillance video captures unauthorized physical console cable plugged into PROXY CLUSTER 11.',
        evidenceSnippet: 'VIDEO_CAM: CORRIDOR-11 | TIME: 03:19:04 UTC | ZONE: PROXY CLUSTER 11 | EVENT: SERIAL_CONSOLE_TAP',
        locationLabel: 'Corridor Cam Feed',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Optical Cage Turnstile Reader',
        text: 'Cage scanner confirms network engineer swipe record registered at threshold PROXY CLUSTER 11.',
        evidenceSnippet: 'SWIPE_AUDIT: CAGE-TS-11 | CARD: NET-9921 | DESIGNATED_ZONE: PROXY CLUSTER 11 | STATUS: UNLOCKED',
        locationLabel: 'Cage Reader Panel',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Hardware Load Balancer Chassis',
        text: 'F5 BIG-IP active-standby cluster processing 4.2M concurrent requests.',
        position: 'top-[22%] left-[48%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Encrypted Certificate Storage Box',
        text: 'Sealed metal canister storing hardware tokens for SSL certificate rotation.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Microsegmentation Policy Map',
        text: 'Network microsegmentation rules and SPIFFE ID trust domains.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['PROXY CLUSTER 02', 'PROXY CLUSTER 05', 'EDGE BAY 8'],
    options: ['PROXY CLUSTER 11', 'PROXY CLUSTER 02', 'PROXY CLUSTER 05', 'EDGE BAY 8'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'PROXY CLUSTER 11',
      flag: 'CYBERFORT{PROXY_CLUSTER_11}'
    },
    createdAt: 1772418000000
  },

  // 18. Mobile Forensic Unit
  {
    id: 'ch_mobile_18',
    title: 'OPERATION SHADOW HUNT: MOBILE FORENSIC UNIT',
    venueLabel: 'CYBERFORT — TACTICAL FORENSICS — CONTAINMENT VAN 2',
    environmentTheme: 'Mobile Forensic Unit',
    incidentNarrative: 'A recovered mobile burner phone had its bootloader unlocked and hardware NAND imaged offsite. Trace the mobile forensic vehicle identity.',
    themeStyle: {
      accentColor: 'emerald',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      hudTag: 'MOBILE_TACTICAL_VAN2',
      bgHue: 'hue-rotate-[120deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Cellebrite UFED Forensic Console',
        text: 'Cellebrite extraction report confirms physical NAND chip-off extraction executed in CONTAINMENT VAN 2.',
        evidenceSnippet: 'UFED_LOG: PHYSICAL_DUMP_02 | HOST_UNIT: CONTAINMENT VAN 2 | PHONE_MODEL: PIXEL_7A | RESULT: SUCCESS',
        locationLabel: 'UFED Console',
        position: 'top-[44%] left-[25%]',
        iconType: 'harddrive'
      },
      cctv: {
        id: 'cctv',
        name: 'Vehicle Bay Overhead Camera',
        text: 'Bay surveillance feed confirms mobile field vehicle was operational at dock CONTAINMENT VAN 2.',
        evidenceSnippet: 'SURVEILLANCE: BAY-CAM-VAN2 | TIME: 01:29:45 UTC | LOCATION: CONTAINMENT VAN 2 | STATUS: DEPLOYED',
        locationLabel: 'Vehicle Bay Camera',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Vehicle Bay Barrier Turnstile',
        text: 'Electronic gate access log registers evidence courier entry directly into CONTAINMENT VAN 2.',
        evidenceSnippet: 'GATE_SCAN: BAY-GATE-02 | OFFICER_TAG: COURIER-88 | VEHICLE_ID: CONTAINMENT VAN 2 | ENTRY: LOGGED',
        locationLabel: 'Barrier Turnstile',
        position: 'top-[44%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Cellular Base Station Simulator',
        text: 'Rogue GSM/LTE base station simulator for IMSI catcher testing.',
        position: 'top-[22%] left-[46%]',
        iconType: 'wifi'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Faraday Mobile Storage Bag',
        text: 'Multi-layer RF shielding pouch blocking GPS and 5G signals.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Field Warrant Documentation',
        text: 'Search and seizure warrant authorizations and chain of custody sheets.',
        position: 'bottom-[8%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['CONTAINMENT VAN 1', 'CONTAINMENT TRUCK 4', 'LAB 3'],
    options: ['CONTAINMENT VAN 2', 'CONTAINMENT VAN 1', 'CONTAINMENT TRUCK 4', 'LAB 3'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'CONTAINMENT VAN 2',
      flag: 'CYBERFORT{CONTAINMENT_VAN_2}'
    },
    createdAt: 1772418000000
  },

  // 19. Dark Web Research Vault
  {
    id: 'ch_darkweb_19',
    title: 'OPERATION SHADOW HUNT: DARK WEB RESEARCH VAULT',
    venueLabel: 'CYBERFORT — UNDERGROUND THREAT INTEL — ISOLATION CELL 8',
    environmentTheme: 'Dark Web Research Vault',
    incidentNarrative: 'An automated crawler scraped forum credentials leaked from an enterprise database breach. Isolate the research cell conducting the operation.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(168, 85, 247, 0.35)',
      hudTag: 'DARKWEB_ISOLATION_CELL8',
      bgHue: 'hue-rotate-[290deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Tor Circuit Analysis Workstation',
        text: 'Onion router relay telemetry traces automated crawler database dumps originating in ISOLATION CELL 8.',
        evidenceSnippet: 'ONION_LOG: TOR-CIRCUIT-991 | EXIT_NODE: RELAY_77 | INTERNAL_ORIGIN: ISOLATION CELL 8 | STATUS: STREAMING',
        locationLabel: 'Tor Workstation',
        position: 'top-[42%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Isolation Vault Surveillance Cam',
        text: 'Ceiling optical camera recorded unauthorized hardware wallet extraction inside ISOLATION CELL 8.',
        evidenceSnippet: 'OPTICAL_FEED: CAM-ISO-08 | TIME: 03:59:02 UTC | LOCATION: ISOLATION CELL 8 | EVENT: HARDWARE_KEY_SEIZED',
        locationLabel: 'Vault Interior Camera',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Airgap Cell Door Scanner',
        text: 'Electronic lock mechanism records emergency entry pass swiped for ingress to ISOLATION CELL 8.',
        evidenceSnippet: 'DOOR_LOG: CELL-LOCK-08 | SCAN_RESULT: ACCESS_AUTHORIZED | DESTINATION_ROOM: ISOLATION CELL 8',
        locationLabel: 'Cell Door Scanner',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Crypto Blockchain Node',
        text: 'Bitcoin and Monero full node blockchain ledger verifying exfiltration wallets.',
        position: 'top-[22%] left-[48%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Trezor Hardware Wallet Locker',
        text: 'PIN-protected cold storage hardware wallet enclosure.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Darknet Forum Intel Dossier',
        text: 'Underground forum handles and PGP public key records.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['ISOLATION CELL 2', 'ISOLATION CELL 5', 'VAULT DELTA'],
    options: ['ISOLATION CELL 8', 'ISOLATION CELL 2', 'ISOLATION CELL 5', 'VAULT DELTA'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'ISOLATION CELL 8',
      flag: 'CYBERFORT{ISOLATION_CELL_8}'
    },
    createdAt: 1772418000000
  },

  // 20. AI Security Red Team Arena
  {
    id: 'ch_ai_20',
    title: 'OPERATION SHADOW HUNT: AI SECURITY RED TEAM ARENA',
    venueLabel: 'CYBERFORT — NEURAL ARENA — NEURAL CLUSTER 1',
    environmentTheme: 'AI Security Red Team Arena',
    incidentNarrative: 'Prompt injection and model weights exfiltration occurred against an enterprise LLM pipeline. Identify the target GPU compute cluster.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      hudTag: 'AI_REDTEAM_NEURAL1',
      bgHue: 'hue-rotate-[190deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Model Weights Extraction Terminal',
        text: 'VRAM extraction diagnostic confirms model checkpoint binary dumped from server blade NEURAL CLUSTER 1.',
        evidenceSnippet: 'AI_AUDIT: WEIGHT_EXFIL_88 | GPU_NODE: H100-NODE-01 | ENCLOSURE: NEURAL CLUSTER 1 | BYTES_DUMPED: 140GB',
        locationLabel: 'GPU Terminal',
        position: 'top-[44%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'High-Density Rack Cam 01',
        text: 'Camera records an unauthorized liquid-cooling bypass probe attached to NEURAL CLUSTER 1.',
        evidenceSnippet: 'VIDEO_CAM: AI-AISLE-01 | TIMESTAMP: 02:11:45 UTC | LOCATION: NEURAL CLUSTER 1 | EVENT: NVLINK_SNIFFER',
        locationLabel: 'Rack Camera Feed',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Neural Arena Turnstile Barrier',
        text: 'Turnstile log registers AI security researcher access granted to perimeter NEURAL CLUSTER 1.',
        evidenceSnippet: 'GATE_ENTRY: ARENA-GATE-01 | RESEARCHER_ID: AI-SEC-09 | TARGET_BAY: NEURAL CLUSTER 1 | STATUS: OK',
        locationLabel: 'Arena Turnstile',
        position: 'top-[46%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: '800G InfiniBand Quantum Switch',
        text: 'NVIDIA Quantum-2 InfiniBand switch with 400Gb/s per port. Sub-microsecond latency.',
        position: 'top-[22%] left-[46%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Direct-to-Chip Liquid Chiller',
        text: 'Dielectric fluid circulation operating at 32.0°C under full compute load.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Adversarial Prompt Corpus Binder',
        text: 'Indirect prompt injection test vectors and jailbreak taxonomy.',
        position: 'bottom-[8%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['NEURAL CLUSTER 3', 'NEURAL CLUSTER 7', 'GPU POD 4'],
    options: ['NEURAL CLUSTER 1', 'NEURAL CLUSTER 3', 'NEURAL CLUSTER 7', 'GPU POD 4'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'NEURAL CLUSTER 1',
      flag: 'CYBERFORT{NEURAL_CLUSTER_1}'
    },
    createdAt: 1772418000000
  },

  // 21. Micro-Electronics Hardening Lab
  {
    id: 'ch_cleanroom_21',
    title: 'OPERATION SHADOW HUNT: MICRO-ELECTRONICS LAB',
    venueLabel: 'CYBERFORT — HARDWARE SECURITY — CLEANROOM 6',
    environmentTheme: 'Micro-Electronics Hardening Lab',
    incidentNarrative: 'Focused ion beam (FIB) decapsulation was detected on a secure cryptoprocessor ASIC. Identify the breached cleanroom lab.',
    themeStyle: {
      accentColor: 'emerald',
      glowColor: 'rgba(5, 150, 105, 0.35)',
      hudTag: 'HARDWARE_CLEANROOM_6',
      bgHue: 'hue-rotate-[135deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Focused Ion Beam Microscope Console',
        text: 'FIB operator audit reveals unauthorized silicon metal layer etching executed in CLEANROOM 6.',
        evidenceSnippet: 'FIB_DUMP: FIB-MICROSCOPE-06 | DIE_ID: SEC-ENCLAVE-ASIC | ROOM: CLEANROOM 6 | STATUS: LAYER_EXPOSED',
        locationLabel: 'FIB Microscope',
        position: 'top-[42%] left-[24%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'ISO Class 5 Cleanroom Camera',
        text: 'Surveillance video recorded an unrecognized wafer carrier transported into CLEANROOM 6.',
        evidenceSnippet: 'CAM_FEED: CLEAN-ISO5-06 | UTC: 03:39:18 | LOCATION: CLEANROOM 6 | EVENT: UNLOGGED_WAFER_CARRIER',
        locationLabel: 'Cleanroom Overhead Cam',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Air-Shower Airlock Entry Scanner',
        text: 'High-pressure deionizing air-shower log confirms technician entry granted for chamber CLEANROOM 6.',
        evidenceSnippet: 'AIR_SHOWER: SHOWER-06 | GOWNING_ID: TECH-771 | DESTINATION: CLEANROOM 6 | PARTICULATE: NOMINAL',
        locationLabel: 'Air-Shower Gate',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Semiconductor Wafer Prober',
        text: 'Micro-probing station with 50-nanometer tungsten tips calibrated.',
        position: 'top-[22%] left-[48%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Nitrogen Purged Wafer Desiccator',
        text: 'Ultra-dry nitrogen storage cabinet preserving decapped silicon chips.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'ASIC Silicon Layout Masks',
        text: 'GDSII layout files and hardware trojan inspection logs.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['CLEANROOM 1', 'CLEANROOM 3', 'LAB 4'],
    options: ['CLEANROOM 6', 'CLEANROOM 1', 'CLEANROOM 3', 'LAB 4'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'CLEANROOM 6',
      flag: 'CYBERFORT{CLEANROOM_6}'
    },
    createdAt: 1772418000000
  },

  // 22. Identity & Access Management Sanctum
  {
    id: 'ch_iam_22',
    title: 'OPERATION SHADOW HUNT: IAM SANCTUM',
    venueLabel: 'CYBERFORT — IDENTITY VAULT — IAM SECTOR 15',
    environmentTheme: 'Identity & Access Management Sanctum',
    incidentNarrative: 'An unauthorized SAML assertion signing certificate was minted to impersonate global administrators. Trace the identity enclave.',
    themeStyle: {
      accentColor: 'violet',
      glowColor: 'rgba(168, 85, 247, 0.35)',
      hudTag: 'IAM_AUTHORITY_SEC15',
      bgHue: 'hue-rotate-[265deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'SAML IdP Gateway Workstation',
        text: 'Identity federation log flags unauthorized golden SAML token signing event from IAM SECTOR 15.',
        evidenceSnippet: 'SAML_FEDERATION: EVENT-9901 | IDP_HOST: IDP-GW-15 | VENUE: IAM SECTOR 15 | STATUS: FORGED_ASSERTION',
        locationLabel: 'IdP Workstation',
        position: 'top-[44%] left-[26%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'IAM Vault PTZ Surveillance',
        text: 'Camera captures unauthorized flash drive plugged into root IdP server in IAM SECTOR 15.',
        evidenceSnippet: 'PTZ_FEED: IAM-VAULT-15 | TIMESTAMP: 02:59:11 UTC | LOCATION: IAM SECTOR 15 | INCIDENT: USB_INSERTION',
        locationLabel: 'Vault PTZ Cam',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Three-Factor Biometric Airlock',
        text: 'Airlock access ledger verifies security officer credentials swiped into enclave IAM SECTOR 15.',
        evidenceSnippet: 'AIRLOCK_3FA: SCAN-SEC-15 | OFFICER: ADMIN-001 | AUTHORIZED_ENCLAVE: IAM SECTOR 15 | RESULT: UNLOCKED',
        locationLabel: 'Airlock 3FA Panel',
        position: 'top-[46%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'OAuth Token Revocation Gateway',
        text: 'Redis-backed token revocation blacklist operating with sub-millisecond sync.',
        position: 'top-[22%] left-[46%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Hardware Token Seed Vault',
        text: 'Tamper-resistant storage locker holding TOTP seed vectors.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Access Matrix Role Hierarchy',
        text: 'Role-based access control (RBAC) graphs and privilege escalation maps.',
        position: 'bottom-[8%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['IAM SECTOR 03', 'IAM SECTOR 08', 'AUTH VAULT 2'],
    options: ['IAM SECTOR 15', 'IAM SECTOR 03', 'IAM SECTOR 08', 'AUTH VAULT 2'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'IAM SECTOR 15',
      flag: 'CYBERFORT{IAM_SECTOR_15}'
    },
    createdAt: 1772418000000
  },

  // 23. High-Frequency Trading Network Bunker
  {
    id: 'ch_trading_23',
    title: 'OPERATION SHADOW HUNT: LOW-LATENCY TRADING BUNKER',
    venueLabel: 'CYBERFORT — TELECOM BUNKER — FIBER VAULT 7',
    environmentTheme: 'High-Frequency Trading Network Bunker',
    incidentNarrative: 'Nanosecond microwave radio taps intercepted market telemetry packets. Identify the physical telecom vault where the tap was established.',
    themeStyle: {
      accentColor: 'cyan',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      hudTag: 'TRADING_BUNKER_FIBER7',
      bgHue: 'hue-rotate-[180deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'FPGA Packet Timestamping Kiosk',
        text: 'Nanosecond precision FPGA time card alerts on anomalous 12-nanosecond delay across FIBER VAULT 7.',
        evidenceSnippet: 'FPGA_PTP: PRECISION-NIC-07 | CLOCK: IEEE-1588v2 | ASSET_ZONE: FIBER VAULT 7 | DELAY: +12.4_NS',
        locationLabel: 'FPGA Kiosk',
        position: 'top-[42%] left-[25%]',
        iconType: 'terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'Subterranean Bunker Camera 07',
        text: 'Thermal camera recording identifies an active hardware tap drawing heat inside FIBER VAULT 7.',
        evidenceSnippet: 'THERMAL_CAM: BUNK-CH-07 | UTC: 04:22:30 | ROOM: FIBER VAULT 7 | HEAT_ANOMALY: +8.5C_ABOVE_AMBIENT',
        locationLabel: 'Thermal Cam Feed',
        position: 'top-[16%] right-[22%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Blast-Proof Bunker Hatch Reader',
        text: 'Pressure hatch security terminal flags manual hatch latch disengaged at FIBER VAULT 7.',
        evidenceSnippet: 'HATCH_LOG: HATCH-07 | SENSOR: HYDRAULIC_SEAL | TARGET_VAULT: FIBER VAULT 7 | STATE: OPEN',
        locationLabel: 'Hatch Reader Panel',
        position: 'top-[44%] right-[8%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Rubidium Atomic Frequency Standard',
        text: 'Atomic clock synchronization signal stable within 1x10^-11 precision.',
        position: 'top-[22%] left-[48%]',
        iconType: 'server'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Sub-Nanosecond Fiber Spool Locker',
        text: 'Length-matched optical fiber coils matching exchange cross-connect latencies.',
        position: 'bottom-[12%] left-[10%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Microwave Line of Sight Maps',
        text: 'Direct line-of-sight microwave link azimuths and tower coordinates.',
        position: 'bottom-[8%] right-[32%]',
        iconType: 'file'
      }
    },
    distractors: ['FIBER VAULT 2', 'FIBER VAULT 5', 'NOC BUNKER 9'],
    options: ['FIBER VAULT 7', 'FIBER VAULT 2', 'FIBER VAULT 5', 'NOC BUNKER 9'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'FIBER VAULT 7',
      flag: 'CYBERFORT{FIBER_VAULT_7}'
    },
    createdAt: 1772418000000
  },

  // 24. Disaster Recovery Shadow Data Center
  {
    id: 'ch_dr_24',
    title: 'OPERATION SHADOW HUNT: DISASTER RECOVERY SHADOW DC',
    venueLabel: 'CYBERFORT — SHADOW DATACENTER — BACKUP POD 3',
    environmentTheme: 'Disaster Recovery Shadow Data Center',
    incidentNarrative: 'Warm-standby replication was manipulated to overwrite immutable backup catalogs with corrupted snapshots. Identify the affected shadow pod.',
    themeStyle: {
      accentColor: 'emerald',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      hudTag: 'DISASTER_RECOVERY_POD3',
      bgHue: 'hue-rotate-[125deg]'
    },
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'SAN Replication Management Terminal',
        text: 'Storage Area Network snapshot daemon alerts on unauthorized block delta deletion in BACKUP POD 3.',
        evidenceSnippet: 'SAN_AUDIT: REPL_ABORT_88 | STORAGE_POOL: POOL-B3 | POD_ID: BACKUP POD 3 | INTEGRITY: COMPROMISED',
        locationLabel: 'SAN Terminal',
        position: 'top-[44%] left-[26%]',
        iconType: 'harddrive'
      },
      cctv: {
        id: 'cctv',
        name: 'Shadow Datacenter Cold Aisle Cam',
        text: 'Overhead optical sensor detects unauthorized direct fibre channel tap plugged into BACKUP POD 3.',
        evidenceSnippet: 'VIDEO_CAM: SHADOW-03 | TIME: 03:41:59 UTC | POD_LOCATION: BACKUP POD 3 | DETECTION: ROGUE_FIBRE_TAP',
        locationLabel: 'Cold Aisle Camera',
        position: 'top-[16%] right-[24%]',
        iconType: 'eye'
      },
      access_log: {
        id: 'access_log',
        name: 'Secondary Site Turnstile Gate',
        text: 'Disaster recovery site turnstile reader logs credentials admitted for maintenance at BACKUP POD 3.',
        evidenceSnippet: 'GATE_ENTRY: DR-GATE-03 | TECHNICIAN: DR-OPS-44 | ASSIGNED_ZONE: BACKUP POD 3 | VERIFICATION: PASSED',
        locationLabel: 'DR Gate Turnstile',
        position: 'top-[44%] right-[7%]',
        iconType: 'key'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Synchronous Dark Fiber Multiplexer',
        text: 'Dual-path 80-kilometer dark fiber circuit connecting primary datacenter.',
        position: 'top-[22%] left-[46%]',
        iconType: 'network'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'LTO-9 Tape Library Robotic Carousel',
        text: 'Automated 500-slot robotic tape library storing airgapped recovery sets.',
        position: 'bottom-[12%] left-[12%]',
        iconType: 'box'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Business Continuity Recovery Binder',
        text: 'RTO (Recovery Time Objective) and RPO (Recovery Point Objective) SLA sheets.',
        position: 'bottom-[8%] right-[30%]',
        iconType: 'file'
      }
    },
    distractors: ['BACKUP POD 1', 'BACKUP POD 5', 'VAULT DELTA'],
    options: ['BACKUP POD 3', 'BACKUP POD 1', 'BACKUP POD 5', 'VAULT DELTA'],
    hints: [...STANDARD_PROGRESSIVE_HINTS],
    secretKey: {
      commonLocationPhrase: 'BACKUP POD 3',
      flag: 'CYBERFORT{BACKUP_POD_3}'
    },
    createdAt: 1772418000000
  }
];
