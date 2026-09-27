# Hertz Auto Post — Program Telemetry & Controller API Documentation

เอกสารฉบับนี้จัดทำขึ้นสำหรับนักพัฒนาโปรแกรมบอท (Client Desktop App / Hertz Auto Post) เพื่อเชื่อมต่อ ส่งข้อมูล Telemetry, สถานะออนไลน์, สถิติการทำงานแยกตามฟังก์ชัน และรายงานข้อผิดพลาด (Error Logs) แบบเรียลไทม์เข้าสู่เซิร์ฟเวอร์ **Hertz Manager** สำหรับแสดงผลบนหน้า **"ภาพรวมของโปรแกรม" (Program Overview Dashboard)**

---

## 1. ภาพรวมระบบและการทำงาน (Architecture Overview)

```
┌──────────────────────────────────────────────┐
│  Hertz Auto Post (Client Desktop Bot)        │
│                                              │
│  - ทุก 5-10 วินาที  ──> HEARTBEAT            │
│  - ทุกครั้งที่รันงาน ──> PUSH_LOG (ผลลัพธ์)     │
│  - ตอนเปิดโปรแกรม    ──> SYNC_STATE           │
└──────────────────────┬───────────────────────┘
                       │ HTTP POST (JSON)
                       ▼
┌──────────────────────────────────────────────┐
│  Hertz Server API                            │
│  (/api/v1/public/controller/from-program)    │
│                                              │
│  - ตรวจสอบความถูกต้องของ Key & HWID           │
│  - ประมวลผล In-Memory Session (controllerHub)│
│  - คำนวณ Success Rate และแยกสถิติฟังก์ชัน     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Admin Dashboard (ภาพรวมของโปรแกรม)           │
│  - สถานะออนไลน์ / ออฟไลน์ (Live Indicator)     │
│  - Fleet Success Rate รวมและแยกรายเครื่อง     │
│  - ชี้เป้าฟังก์ชันที่มีปัญหา (Weakest Action)  │
│  - สตรีม Error Logs สดจากเครื่องลูกค้า        │
└──────────────────────────────────────────────┘
```

---

## 2. ข้อมูลการเรียก API (Endpoint Specifications)

- **URL**: `https://{YOUR_DOMAIN}/api/v1/public/controller/from-program`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: ยืนยันตัวตนผ่านฟิลด์ `code` (License Key) และ `hwid` (Hardware ID) ใน Request Body

### สถานะการตอบกลับ (Response Codes):
| HTTP Status | ความหมาย | คำอธิบาย |
| :--- | :--- | :--- |
| `200 OK` | สำเร็จ | เซิร์ฟเวอร์รับข้อมูลและประมวลผลเรียบร้อย |
| `400 Bad Request` | ข้อมูลไม่ถูกต้อง | ไม่ได้ส่งรหัสคีย์ หรือรูปแบบข้อมูลไม่ถูกต้อง |
| `403 Forbidden` | ไม่อนุญาต | HWID ไม่ตรง, คีย์ถูกระงับ หรือคีย์หมดอายุ |
| `500 Internal Error` | ข้อผิดพลาดภายใน | เซิร์ฟเวอร์ไม่สามารถประมวลผลได้ |

---

## 3. รูปแบบการส่งข้อมูล (Request Payloads)

การส่งข้อมูลแบ่งออกเป็น **3 รูปแบบหลัก** ตามจังหวะการทำงานของโปรแกรม:

---

### รูปแบบที่ 1: Heartbeat (ส่งสม่ำเสมอทุกๆ 5 – 10 วินาที)
> **วัตถุประสงค์**: เพื่อรักษาสถานะ **"ออนไลน์ (Online)"** ของเครื่องบนระบบหลังบ้าน  
> ⚠️ **ข้อควรระวัง**: หากเซิร์ฟเวอร์ไม่ได้รับสัญญาณ PING/HEARTBEAT นานเกิน **15 วินาที** เซิร์ฟเวอร์จะตัดสถานะเครื่องนั้นเป็น **"ออฟไลน์ (Offline)"** ทันที

#### Request Body:
```json
{
  "code": "HERTZ-1CA1-FF66-C7B9",
  "hwid": "4B8F-9A2E-C15D-78F0",
  "action": "HEARTBEAT",
  "ackCommandIds": []
}
```

#### Response Body:
```json
{
  "success": true,
  "isProgramOnline": true,
  "commands": []
}
```
> *หมายเหตุ: หากแอดมินหรือผู้ใช้สั่งการจากหน้าเว็บ (เช่น สั่งหยุดบอท / สั่งเริ่มงาน) คำสั่งจะส่งกลับมาในอาร์เรย์ `commands` เพื่อให้นำไปประมวลผลต่อ และส่ง `ackCommandIds` กลับมาในรอบถัดไป*

---

### รูปแบบที่ 2: Push Log (ส่งทันทีเมื่อจบงานแต่ละรอบ / Event-driven)
> **วัตถุประสงค์**: ส่งผลลัพธ์ของแต่ละงาน (โพสต์, คอมเมนต์, กดรีแอคชั่น) เพื่อให้เซิร์ฟเวอร์นำไปคำนวณ **Success Rate (%)** และแสดง **ข้อความ Error** บนหน้าแดชบอร์ด

#### ฟิลด์ข้อมูลใน `log`:
| ฟิลด์ | ชนิดข้อมูล | ค่าที่รองรับ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| **`action`** | `string` | `"POST"` \| `"COMMENT"` \| `"REACTION"` \| `"SYSTEM"` | ประเภทของฟังก์ชันงาน |
| **`status`** | `string` | `"SUCCESS"` \| `"FAILED"` \| `"INFO"` | ผลลัพธ์ของงาน |
| **`message`** | `string` | ข้อความอธิบายผลลัพธ์จริง | เช่น "โพสต์สำเร็จ", "ติด Checkpoint บล็อกการโพสต์" |
| **`accountName`** | `string` | ชื่อบัญชี Facebook | เช่น "สมชาย ใจดี (FB_01)" |
| **`accountId`** | `string` | รหัสอ้างอิงบัญชี | เช่น "acc_101" |
| **`groupName`** | `string` | (ตัวเลือก) ชื่อกลุ่มเป้าหมาย | เช่น "กลุ่ม ซื้อขายของมือสอง" |

---

#### ตัวอย่าง 2.1: งานสำเร็จ (SUCCESS)
```json
{
  "code": "HERTZ-1CA1-FF66-C7B9",
  "hwid": "4B8F-9A2E-C15D-78F0",
  "action": "PUSH_LOG",
  "autoCountStats": true,
  "log": {
    "action": "POST",
    "status": "SUCCESS",
    "message": "โพสต์ลงกลุ่มสำเร็จ",
    "accountName": "สมชาย ใจดี (FB_01)",
    "accountId": "acc_101",
    "groupName": "กลุ่มซื้อขายคอมพิวเตอร์มือสอง"
  }
}
```

#### ตัวอย่าง 2.2: งานล้มเหลว (FAILED) — *เซิร์ฟเวอร์จะดึงข้อความนี้ไปแสดงใน Error Stream และ Inspector*
```json
{
  "code": "HERTZ-1CA1-FF66-C7B9",
  "hwid": "4B8F-9A2E-C15D-78F0",
  "action": "PUSH_LOG",
  "autoCountStats": true,
  "log": {
    "action": "COMMENT",
    "status": "FAILED",
    "message": "ติด Checkpoint บล็อกการคอมเมนต์ชั่วคราว (Spam Restriction)",
    "accountName": "วิชัย รวยทรัพย์ (FB_02)",
    "accountId": "acc_102",
    "groupName": "กลุ่มหางานฟรีแลนซ์"
  }
}
```

#### ตัวอย่าง 2.3: ส่งทีละหลาย Log พร้อมกัน (Batch Logs)
กรณีที่บอทรันหลายบัญชีพร้อมกัน สามารถส่งเป็นอาร์เรย์ `logs` ได้:
```json
{
  "code": "HERTZ-1CA1-FF66-C7B9",
  "hwid": "4B8F-9A2E-C15D-78F0",
  "action": "PUSH_LOGS",
  "autoCountStats": true,
  "logs": [
    {
      "action": "POST",
      "status": "SUCCESS",
      "message": "แชร์โพสต์ลงกลุ่มสำเร็จ",
      "accountName": "FB_01",
      "accountId": "acc_01",
      "groupName": "กลุ่ม A"
    },
    {
      "action": "COMMENT",
      "status": "FAILED",
      "message": "กลุ่มปิดรับความคิดเห็นจากบุคคลภายนอก",
      "accountName": "FB_02",
      "accountId": "acc_02",
      "groupName": "กลุ่ม B"
    }
  ]
}
```

---

### รูปแบบที่ 3: Sync State (ส่งตอนเปิดโปรแกรม หรือทุกๆ 30 – 60 วินาที)
> **วัตถุประสงค์**: เพื่ออัปเดตสถิติรวมสะสม (Total Stats) และสถานะบัญชีทั้งหมดของเครื่อง

#### Request Body:
```json
{
  "code": "HERTZ-1CA1-FF66-C7B9",
  "hwid": "4B8F-9A2E-C15D-78F0",
  "action": "SYNC_STATE",
  "stats": {
    "total": 150,
    "success": 140,
    "failed": 10,
    "pending": 2
  },
  "accounts": [
    {
      "id": "acc_101",
      "name": "สมชาย ใจดี (FB_01)",
      "isRunning": true,
      "currentTask": "กำลังเตรียมคอมเมนต์",
      "groupName": "กลุ่มซื้อขายคอมพิวเตอร์มือสอง",
      "groupCurrent": 5,
      "groupTotal": 20,
      "stats": {
        "total": 50,
        "success": 48,
        "failed": 2,
        "post": 30,
        "comment": 15,
        "reaction": 5
      }
    }
  ]
}
```

---

## 4. ตัวอย่างการเขียนโค้ดสำหรับฝั่งตัวโปรแกรม (Client Code Implementation)

### 4.1 ตัวอย่างภาษา Python (สำหรับบอทที่พัฒนาด้วย Python)

```python
import time
import threading
import requests

API_ENDPOINT = "https://your-domain.com/api/v1/public/controller/from-program"
KEY_CODE = "HERTZ-1CA1-FF66-C7B9"
HWID = "4B8F-9A2E-C15D-78F0"

class HertzTelemetryClient:
    def __init__(self, key_code, hwid):
        self.key_code = key_code
        self.hwid = hwid
        self.is_running = True
        self.heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)

    def start(self):
        """เริ่มการส่ง Heartbeat เบื้องหลัง"""
        self.heartbeat_thread.start()
        print("[Hertz] Telemetry Client Started.")

    def _heartbeat_loop(self):
        """วนลูปส่ง Heartbeat ทุกๆ 8 วินาที"""
        while self.is_running:
            try:
                payload = {
                    "code": self.key_code,
                    "hwid": self.hwid,
                    "action": "HEARTBEAT"
                }
                res = requests.post(API_ENDPOINT, json=payload, timeout=5)
                if res.status_code == 200:
                    data = res.json()
                    commands = data.get("commands", [])
                    if commands:
                        self.handle_incoming_commands(commands)
            except Exception as e:
                print("[Hertz] Heartbeat Error:", e)
            
            time.sleep(8)

    def log_task(self, action: str, status: str, message: str, account_name: str, account_id: str = "acc", group_name: str = ""):
        """
        เรียกใช้เมื่อบอททำงานแต่ละงานเสร็จ
        - action: 'POST' | 'COMMENT' | 'REACTION'
        - status: 'SUCCESS' | 'FAILED'
        """
        payload = {
            "code": self.key_code,
            "hwid": self.hwid,
            "action": "PUSH_LOG",
            "autoCountStats": True,
            "log": {
                "action": action,
                "status": status,
                "message": message,
                "accountName": account_name,
                "accountId": account_id,
                "groupName": group_name
            }
        }
        try:
            requests.post(API_ENDPOINT, json=payload, timeout=5)
        except Exception as e:
            print("[Hertz] Push Log Error:", e)

    def handle_incoming_commands(self, commands):
        for cmd in commands:
            cmd_type = cmd.get("type")
            print(f"[Hertz] Received Remote Command: {cmd_type}")

# ==================== ตัวอย่างการนำไปใช้งานจริง ====================
client = HertzTelemetryClient(KEY_CODE, HWID)
client.start()

# 1. จำลองการโพสต์กลุ่มสำเร็จ
client.log_task(
    action="POST",
    status="SUCCESS",
    message="โพสต์รูปภาพและข้อความลงกลุ่มสำเร็จ",
    account_name="สมชาย (FB_01)",
    group_name="กลุ่มตลาดนัดไอที"
)

# 2. จำลองการคอมเมนต์ล้มเหลว (ติดจำกัดความถี่)
client.log_task(
    action="COMMENT",
    status="FAILED",
    message="บัญชีติดข้อจำกัดการแสดงความคิดเห็นจาก Facebook (Rate Limit)",
    account_name="วิชัย (FB_02)",
    group_name="กลุ่มหางาน กทม."
)
```

---

### 4.2 ตัวอย่างภาษา TypeScript / Node.js (Electron / Desktop)

```typescript
import axios from "axios";

interface LogPayload {
  action: "POST" | "COMMENT" | "REACTION";
  status: "SUCCESS" | "FAILED";
  message: string;
  accountName: string;
  accountId?: string;
  groupName?: string;
}

export class HertzClient {
  private endpoint = "https://your-domain.com/api/v1/public/controller/from-program";
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(private keyCode: string, private hwid: string) {}

  public startHeartbeat() {
    this.sendHeartbeat();
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), 8_000);
  }

  public stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  private async sendHeartbeat() {
    try {
      const res = await axios.post(this.endpoint, {
        code: this.keyCode,
        hwid: this.hwid,
        action: "HEARTBEAT",
      });
      // จัดการ commands ที่ส่งกลับมาจากหลังบ้าน
      if (res.data.commands?.length > 0) {
        console.log("Incoming server commands:", res.data.commands);
      }
    } catch (err: any) {
      console.error("Heartbeat error:", err.message);
    }
  }

  public async pushLog(log: LogPayload) {
    try {
      await axios.post(this.endpoint, {
        code: this.keyCode,
        hwid: this.hwid,
        action: "PUSH_LOG",
        autoCountStats: true,
        log,
      });
    } catch (err: any) {
      console.error("Push log error:", err.message);
    }
  }
}
```

---

## 5. ตารางสรุปการทำงาน (Summary Cheat Sheet)

| เหตุการณ์ | ส่ง Action อะไร? | ส่งตอนไหน? | ผลลัพธ์บน Admin Dashboard |
| :--- | :--- | :--- | :--- |
| **โปรแกรมเปิดทำงาน** | `SYNC_STATE` | เมื่อเปิดโปรแกรม | ขึ้นสถานะ Online, โหลดรายชื่อบัญชี และเซ็ตตัวเลขตั้งต้น |
| **ตลอดเวลาที่รัน** | `HEARTBEAT` | ทุก 5 - 10 วินาที | รักษาจุดสีเขียว `Live Online` (หากขาดหายเกิน 15s จะกลายเป็น Offline) |
| **โพสต์/คอมเมนต์/รีแอคชั่น สำเร็จ** | `PUSH_LOG` (`status: "SUCCESS"`) | ทันทีที่งานเสร็จ | เพิ่มยอด Success, เพิ่ม Success Rate (%) ของฟังก์ชันนั้นๆ |
| **งานติด Checkpoint/บล็อก/Error** | `PUSH_LOG` (`status: "FAILED"`) | ทันทีที่พบ Error | เพิ่มยอด Failed, ลด Success Rate, ส่งข้อความ Error เข้าสู่ Fleet Live Stream |
| **ปิดโปรแกรม** | (ไม่ต้องส่ง หรือส่ง Heartbeat ไม่ถึง) | เมื่อผู้ใช้ปิดโปรแกรม | เซิร์ฟเวอร์ตัดเป็น Offline อัตโนมัติ โดยยังจำสถิติล่าสุดไว้ |
