"""Architecture diagram for the PharmaChain Hyperledger-Fabric traceability system."""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from matplotlib.lines import Line2D

# Colors (Nexus palette, muted + 1 accent)
BG = "#F7F6F2"
SURFACE = "#FBFBF9"
BORDER = "#D4D1CA"
TEXT = "#28251D"
MUTED = "#7A7974"
ACCENT = "#01696F"      # Fabric / ledger
WARM = "#A84B2F"        # Client / user layer
SECOND = "#1B474D"       # MySQL / business layer
GOLD = "#D19900"         # Chaincode

fig, ax = plt.subplots(figsize=(13, 9), dpi=200)
ax.set_xlim(0, 13)
ax.set_ylim(0, 9)
ax.set_facecolor(BG)
fig.patch.set_facecolor(BG)
ax.axis("off")


def box(x, y, w, h, title, subtitle="", fill=SURFACE, border=BORDER, tcolor=TEXT):
    patch = FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.02,rounding_size=0.18",
        linewidth=1.4, edgecolor=border, facecolor=fill,
    )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h - 0.32, title, ha="center", va="top",
            fontsize=11.5, fontweight="bold", color=tcolor)
    if subtitle:
        ax.text(x + w / 2, y + h - 0.72, subtitle, ha="center", va="top",
                fontsize=8.8, color=MUTED)


def arrow(x1, y1, x2, y2, label="", color=MUTED, ls="-", curve=0.0):
    a = FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle="-|>", mutation_scale=14,
        linewidth=1.3, color=color, linestyle=ls,
        connectionstyle=f"arc3,rad={curve}",
    )
    ax.add_patch(a)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + 0.15
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=7.8, color=MUTED, style="italic",
                bbox=dict(facecolor=BG, edgecolor="none", pad=1.2))


# Title
ax.text(6.5, 8.55, "PharmaChain — System Architecture",
        ha="center", fontsize=17, fontweight="bold", color=TEXT)
ax.text(6.5, 8.2, "Medicine traceability on Hyperledger Fabric",
        ha="center", fontsize=10.5, color=MUTED, style="italic")

# ─── Row 1: Clients ──────────────────────────────────────────────────────────
box(0.4, 6.6, 3.6, 1.1, "Stakeholder Clients",
    "Manufacturer · Distributor · Pharmacy · Regulator",
    fill="#FFF0EA", border=WARM)
box(4.4, 6.6, 3.5, 1.1, "Patient / Public Verifier",
    "QR scan on smartphone",
    fill="#FFF0EA", border=WARM)
box(8.3, 6.6, 4.3, 1.1, "Admin / Central Authority",
    "Issues X.509 certs · monitors ledger",
    fill="#FFF0EA", border=WARM)

# ─── Row 2: Frontend ─────────────────────────────────────────────────────────
box(1.4, 5.0, 10.2, 1.1, "Next.js 14 Frontend (App Router)",
    "Dashboard · Batches · Medicines · Verification · Ledger Explorer",
    fill=SURFACE, border=BORDER)

# ─── Row 3: Backend API ──────────────────────────────────────────────────────
box(0.4, 3.1, 12.2, 1.6,
    "Express REST API  ( /api/auth · /batches · /medicine-units · /ledger · /verification )",
    "Joi validation · JWT auth · Helmet · RBAC middleware · Winston logs",
    fill=SURFACE, border=BORDER)

# Two sub-services inside the API band
ax.add_patch(FancyBboxPatch((0.7, 3.25), 5.6, 0.8,
    boxstyle="round,pad=0.02,rounding_size=0.12",
    linewidth=1, edgecolor=SECOND, facecolor="#EAF1F2"))
ax.text(3.5, 3.85, "Business Services", ha="center", fontsize=9.5,
        fontweight="bold", color=SECOND)
ax.text(3.5, 3.5, "stakeholder · batch · medicine-unit · prescription · QR",
        ha="center", fontsize=8, color=MUTED)

ax.add_patch(FancyBboxPatch((6.7, 3.25), 5.6, 0.8,
    boxstyle="round,pad=0.02,rounding_size=0.12",
    linewidth=1, edgecolor=ACCENT, facecolor="#E2EFF0"))
ax.text(9.5, 3.85, "Ledger Service + Fabric Gateway", ha="center",
        fontsize=9.5, fontweight="bold", color=ACCENT)
ax.text(9.5, 3.5, "submitTransaction · evaluateTransaction · wallet cache",
        ha="center", fontsize=8, color=MUTED)

# ─── Row 4: MySQL + Fabric peers ─────────────────────────────────────────────
box(0.4, 1.1, 5.4, 1.5, "MySQL 8",
    "Stakeholders · Patients · Medicines · Batches · Units · Prescriptions",
    fill="#EAF1F2", border=SECOND)

# Fabric cluster
ax.add_patch(FancyBboxPatch((6.2, 1.1), 6.4, 1.5,
    boxstyle="round,pad=0.02,rounding_size=0.18",
    linewidth=1.6, edgecolor=ACCENT, facecolor="#E2EFF0"))
ax.text(9.4, 2.35, "Hyperledger Fabric Network",
        ha="center", fontsize=11, fontweight="bold", color=ACCENT)
ax.text(9.4, 2.05, "Channel: pharmachannel  ·  Chaincode: pharma-traceability",
        ha="center", fontsize=8.3, color=MUTED)

# Org1 / Org2 / Orderer tiles
def small_tile(x, y, label, sub, fill="#FFFFFF"):
    p = FancyBboxPatch((x, y), 1.8, 0.65,
        boxstyle="round,pad=0.02,rounding_size=0.1",
        linewidth=0.9, edgecolor=ACCENT, facecolor=fill)
    ax.add_patch(p)
    ax.text(x + 0.9, y + 0.42, label, ha="center", fontsize=8.6,
            fontweight="bold", color=ACCENT)
    ax.text(x + 0.9, y + 0.17, sub, ha="center", fontsize=7.2, color=MUTED)

small_tile(6.35, 1.22, "Org1 Peer", "Mfr + Dist")
small_tile(8.35, 1.22, "Org2 Peer", "Pharm + Reg")
small_tile(10.35, 1.22, "Orderer", "Raft")

# Chaincode box floating at the bottom inside the Fabric cluster
# (move it above — shown as a call-out from ledger service)
ax.add_patch(FancyBboxPatch((6.4, 0.15), 6.2, 0.55,
    boxstyle="round,pad=0.02,rounding_size=0.1",
    linewidth=1, edgecolor=GOLD, facecolor="#FFF6DC"))
ax.text(9.5, 0.58, "Chaincode (Node.js · fabric-contract-api)",
        ha="center", fontsize=9, fontweight="bold", color="#6b4e00")
ax.text(9.5, 0.32,
        "InitLedger · AppendEvent · GetEventById · GetAllEvents · QueryHistory",
        ha="center", fontsize=7.8, color=MUTED)

# ─── Arrows ──────────────────────────────────────────────────────────────────
# clients → frontend
arrow(2.2, 6.6, 4.5, 6.1, "HTTPS", color=WARM)
arrow(6.2, 6.6, 6.5, 6.1, "HTTPS", color=WARM)
arrow(10.4, 6.6, 8.5, 6.1, "HTTPS", color=WARM)
# frontend → API
arrow(6.5, 5.0, 6.5, 4.7, "REST / JSON")
# API → MySQL
arrow(3.2, 3.1, 3.1, 2.6, "mysql2 pool", color=SECOND)
# API (ledger svc) → Fabric
arrow(9.5, 3.25, 9.5, 2.6, "Gateway SDK\nsubmit / evaluate", color=ACCENT)
# Fabric peer → chaincode
arrow(9.5, 1.22, 9.5, 0.7, "invoke", color=GOLD)

# side note on MySQL
ax.text(3.1, 0.65,
        "Note: ledger_blocks table removed in migration 006 —\nthe chain now lives entirely on Fabric.",
        ha="center", fontsize=7.8, color=MUTED, style="italic")

plt.tight_layout()
plt.savefig("/home/user/workspace/LOGIX/architecture.png",
            dpi=220, bbox_inches="tight", facecolor=BG)
print("architecture.png written")
