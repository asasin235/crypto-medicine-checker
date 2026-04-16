"""
Entity-Relationship Diagram for PharmaChain / Crypto-Medicine-Checker
MySQL schema after Hyperledger Fabric migration (ledger_blocks dropped).
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

# Palette (match architecture diagram)
BG = "#F7F6F2"
SURFACE = "#FBFBF9"
BORDER = "#D4D1CA"
TEXT = "#28251D"
MUTED = "#7A7974"
ACCENT = "#01696F"   # Hydra Teal
WARM = "#A84B2F"
GOLD = "#D19900"
DROP = "#BAB9B4"

fig, ax = plt.subplots(figsize=(16, 11))
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 160)
ax.set_ylim(0, 110)
ax.axis("off")

# Title
ax.text(80, 106, "Entity-Relationship Diagram — PharmaChain MySQL Schema",
        fontsize=17, fontweight="bold", ha="center", color=TEXT)
ax.text(80, 102.5,
        "Off-chain operational store · ledger_blocks migrated to Hyperledger Fabric (chaincode state)",
        fontsize=10, ha="center", color=MUTED, style="italic")

def draw_entity(x, y, w, h, title, fields, pk_color=ACCENT, kind="core"):
    """Draw a single entity box."""
    # Shadow
    shadow = FancyBboxPatch((x+0.35, y-0.35), w, h,
                            boxstyle="round,pad=0.02,rounding_size=0.6",
                            linewidth=0, facecolor="#00000012", zorder=1)
    ax.add_patch(shadow)
    # Body
    body_fc = SURFACE if kind == "core" else "#FFFDF6"
    body = FancyBboxPatch((x, y), w, h,
                          boxstyle="round,pad=0.02,rounding_size=0.6",
                          linewidth=1.1, edgecolor=BORDER,
                          facecolor=body_fc, zorder=2)
    ax.add_patch(body)
    # Header strip
    hdr_h = 2.8
    hdr = FancyBboxPatch((x, y+h-hdr_h), w, hdr_h,
                         boxstyle="round,pad=0.02,rounding_size=0.6",
                         linewidth=0, facecolor=pk_color, zorder=3)
    ax.add_patch(hdr)
    # Cover bottom corners of hdr (so bottom is square)
    cover = plt.Rectangle((x, y+h-hdr_h), w, 0.9, facecolor=pk_color,
                          edgecolor=None, zorder=3)
    ax.add_patch(cover)
    # Title text
    ax.text(x+w/2, y+h-hdr_h/2, title, fontsize=10.2, fontweight="bold",
            ha="center", va="center", color="white", zorder=4)
    # Fields
    start_y = y + h - hdr_h - 1.6
    line_h = 1.55
    for i, (mark, name, typ) in enumerate(fields):
        yy = start_y - i * line_h
        # Left marker column
        mc = TEXT
        if mark == "PK": mc = pk_color
        elif mark == "FK": mc = WARM
        elif mark == "UK": mc = GOLD
        ax.text(x+0.8, yy, mark, fontsize=7.4, fontweight="bold",
                ha="left", va="center", color=mc, zorder=4)
        ax.text(x+3.7, yy, name, fontsize=8.2, ha="left", va="center",
                color=TEXT, zorder=4)
        ax.text(x+w-0.8, yy, typ, fontsize=7.4, ha="right", va="center",
                color=MUTED, style="italic", zorder=4)

# Layout grid coordinates (x, y) for top-left corner of each entity
# We'll arrange:
# Row 1 (top):  stakeholders | patients | stakeholder_certificates
# Row 2 (mid):  medicines   | prescriptions
# Row 3 (mid):  batches     | medicine_units
# Row 4 (bot):  verification_logs    | (dropped) ledger_blocks note

# --- Entities ---
stakeholders = [
    ("PK", "id", "BIGINT"),
    ("",   "role", "ENUM"),
    ("",   "company_name", "VARCHAR"),
    ("",   "contact_name", "VARCHAR"),
    ("UK", "email", "VARCHAR"),
    ("UK", "aadhaar_number", "CHAR(12)"),
    ("UK", "license_number", "VARCHAR"),
    ("",   "password_hash", "VARCHAR"),
    ("",   "wallet_address", "VARCHAR"),
    ("",   "created_at / updated_at", "TIMESTAMP"),
]
draw_entity(5, 68, 38, 28, "stakeholders", stakeholders, pk_color=ACCENT)

patients = [
    ("PK", "id", "BIGINT"),
    ("",   "full_name", "VARCHAR"),
    ("UK", "email", "VARCHAR"),
    ("UK", "aadhaar_number", "CHAR(12)"),
    ("",   "date_of_birth", "DATE"),
    ("",   "qr_payload", "TEXT"),
    ("",   "created_at", "TIMESTAMP"),
]
draw_entity(58, 74, 36, 22, "patients", patients, pk_color=ACCENT)

certs = [
    ("PK", "id", "BIGINT"),
    ("FK", "stakeholder_id", "BIGINT"),
    ("",   "certificate", "TEXT"),
    ("",   "signature", "TEXT"),
    ("",   "status", "ENUM"),
    ("",   "issued_at", "TIMESTAMP"),
]
draw_entity(110, 74, 44, 22, "stakeholder_certificates", certs, pk_color=ACCENT)

medicines = [
    ("PK", "id", "BIGINT"),
    ("FK", "manufacturer_id", "BIGINT"),
    ("",   "name", "VARCHAR"),
    ("UK", "sku", "VARCHAR"),
    ("",   "description", "TEXT"),
    ("",   "dosage_form", "VARCHAR"),
    ("",   "strength", "VARCHAR"),
]
draw_entity(5, 41, 38, 22, "medicines", medicines, pk_color=ACCENT)

prescriptions = [
    ("PK", "id", "BIGINT"),
    ("FK", "patient_id", "BIGINT"),
    ("FK", "medicine_id", "BIGINT"),
    ("",   "prescriber_name", "VARCHAR"),
    ("",   "dosage", "VARCHAR"),
    ("",   "instructions", "TEXT"),
    ("",   "issued_at", "TIMESTAMP"),
]
draw_entity(58, 41, 36, 22, "prescriptions", prescriptions, pk_color=ACCENT)

batches = [
    ("PK", "id", "BIGINT"),
    ("FK", "medicine_id", "BIGINT"),
    ("FK", "manufacturer_id", "BIGINT"),
    ("FK", "current_owner_id", "BIGINT"),
    ("UK", "batch_number", "VARCHAR"),
    ("",   "manufacture_date", "DATE"),
    ("",   "expiry_date", "DATE"),
    ("",   "quantity", "INT"),
    ("",   "status", "ENUM"),
]
draw_entity(5, 10, 38, 26, "batches", batches, pk_color=ACCENT)

med_units = [
    ("PK", "id", "BIGINT"),
    ("FK", "batch_id", "BIGINT"),
    ("UK", "serial_number", "VARCHAR"),
    ("",   "qr_data", "TEXT"),
    ("",   "qr_signature", "TEXT"),
    ("",   "qr_image_b64", "LONGTEXT"),
]
draw_entity(58, 14, 36, 22, "medicine_units", med_units, pk_color=ACCENT)

ver_logs = [
    ("PK", "id", "BIGINT"),
    ("FK", "batch_id", "BIGINT"),
    ("FK", "stakeholder_id", "BIGINT NULL"),
    ("",   "verification_status", "ENUM"),
    ("",   "notes", "TEXT"),
    ("",   "created_at", "TIMESTAMP"),
]
draw_entity(110, 41, 44, 22, "verification_logs", ver_logs, pk_color=ACCENT)

# Dropped table — ledger_blocks
drop_box = FancyBboxPatch((110, 10), 44, 26,
                          boxstyle="round,pad=0.02,rounding_size=0.6",
                          linewidth=1.2, edgecolor=DROP,
                          facecolor="#F2EFE8", linestyle="--", zorder=2)
ax.add_patch(drop_box)
ax.text(132, 33.5, "ledger_blocks  (DROPPED)", fontsize=10, fontweight="bold",
        ha="center", color=DROP)
ax.text(132, 30.5, "Migration 006 — removed from MySQL",
        fontsize=8.2, ha="center", color=MUTED, style="italic")
ax.text(132, 26.5, "Events now written to Hyperledger Fabric\n"
        "world-state via PharmaContract chaincode.",
        fontsize=8.5, ha="center", va="center", color=TEXT)
ax.text(132, 20, "Fabric key format:\n"
        "  EVENT_<entity>_<id>_<txNonce>",
        fontsize=7.8, ha="center", va="center", color=ACCENT, family="monospace")
ax.text(132, 14, "Query path: GET /api/ledger/:id\n→ fabric-gateway → chaincode",
        fontsize=7.5, ha="center", va="center", color=MUTED, style="italic")

# --- Relationships (FK arrows) ---
def relate(x1, y1, x2, y2, label, color=WARM, rad=0.15, lx=None, ly=None):
    arr = FancyArrowPatch((x1, y1), (x2, y2),
                          arrowstyle="-|>", mutation_scale=11,
                          linewidth=1.1, color=color,
                          connectionstyle=f"arc3,rad={rad}", zorder=5)
    ax.add_patch(arr)
    if label:
        mx = (x1+x2)/2 if lx is None else lx
        my = (y1+y2)/2 if ly is None else ly
        ax.text(mx, my, label, fontsize=6.8, ha="center", va="center",
                color=color, fontweight="bold",
                bbox=dict(boxstyle="round,pad=0.22", facecolor=BG,
                          edgecolor=color, linewidth=0.6))

# stakeholders -> stakeholder_certificates
relate(43, 86, 110, 85, "1..N  issued", color=WARM, rad=-0.1, lx=78, ly=91)
# stakeholders -> medicines.manufacturer_id
relate(24, 68, 24, 63, "manufacturer_id", color=WARM, rad=0.0, lx=32, ly=65.5)
# medicines -> batches.medicine_id
relate(24, 41, 24, 36, "medicine_id", color=WARM, rad=0.0, lx=32, ly=38.5)
# stakeholders -> batches.manufacturer_id + current_owner_id
relate(10, 68, 10, 36, "manufacturer_id\ncurrent_owner_id", color=WARM, rad=0.0,
       lx=2.5, ly=52)
# batches -> medicine_units
relate(43, 22, 58, 22, "batch_id", color=WARM, rad=0.0, lx=50.5, ly=24)
# batches -> verification_logs
relate(43, 28, 110, 52, "batch_id", color=WARM, rad=0.15, lx=78, ly=36)
# stakeholders -> verification_logs (nullable)
relate(43, 80, 110, 58, "stakeholder_id\n(nullable)", color=WARM, rad=-0.18,
       lx=78, ly=72)
# patients -> prescriptions
relate(76, 74, 76, 63, "patient_id", color=WARM, rad=0.0, lx=84, ly=68.5)
# medicines -> prescriptions
relate(43, 55, 58, 55, "medicine_id", color=WARM, rad=0.0, lx=50.5, ly=57)

# Legend
leg_x, leg_y = 5, 2.5
ax.add_patch(FancyBboxPatch((leg_x, leg_y-0.6), 150, 3.2,
                            boxstyle="round,pad=0.02,rounding_size=0.5",
                            linewidth=0.8, edgecolor=BORDER,
                            facecolor=SURFACE, zorder=1))
ax.text(leg_x+1.5, leg_y+1, "Legend", fontsize=8.5, fontweight="bold",
        color=TEXT)
ax.text(leg_x+12, leg_y+1, "PK primary key", fontsize=8, color=ACCENT,
        fontweight="bold")
ax.text(leg_x+32, leg_y+1, "FK foreign key", fontsize=8, color=WARM,
        fontweight="bold")
ax.text(leg_x+50, leg_y+1, "UK unique key", fontsize=8, color=GOLD,
        fontweight="bold")
ax.text(leg_x+68, leg_y+1, "── / ─ ─ dashed box = table dropped",
        fontsize=8, color=MUTED)
ax.text(leg_x+115, leg_y+1, "Arrows point from child → parent",
        fontsize=8, color=MUTED, style="italic")

plt.tight_layout()
plt.savefig("/home/user/workspace/LOGIX/erd.png", dpi=170,
            bbox_inches="tight", facecolor=BG)
print("saved erd.png")
