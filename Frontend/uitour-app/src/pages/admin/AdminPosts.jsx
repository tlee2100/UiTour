// AdminPosts.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import adminAPI from "../../services/adminAPI";
import { useApp } from "../../contexts/AppContext";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import ToastContainer from "../../components/ToastContainer";
import { useToast } from "../../hooks/useToast";

export default function AdminPosts() {
  const navigate = useNavigate();
  const { user, token } = useApp();
  const { toasts, success, error: showError, removeToast } = useToast();

  const [filter, setFilter] = useState("all"); // all | pending | approved
  const [properties, setProperties] = useState([]);
  const [tours, setTours] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reject modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(null);

  // Delete confirm
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Helpers
  const isActiveTrue = (item) => {
    const v = item.Active !== undefined ? item.Active : item.active;
    return v === true;
  };

  const getItemType = (item) => item.type || (item.PropertyID || item.propertyID ? "property" : "tour");

  const getItemId = (item) => {
    const type = getItemType(item);
    return type === "property"
      ? item.PropertyID || item.propertyID || item.id
      : item.TourID || item.tourID || item.id;
  };

  const getItemTitle = (item) =>
    item.ListingTitle || item.listingTitle || item.TourName || item.tourName || "N/A";

  const formatPrice = (price, currency = "USD") => {
    if (price === null || price === undefined) return "N/A";
    const formatted = new Intl.NumberFormat("vi-VN").format(price);
    return currency === "USD" ? `$${formatted}` : `₫${formatted}`;
  };

  // ✅ Always compute counts from REAL sources, not from filtered lists
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0 });

  // Auth/role gate
  useEffect(() => {
    if (!token) {
      setError("Please log in to continue");
      setLoading(false);
      return;
    }
    if (!user) {
      setError("User information not found");
      setLoading(false);
      return;
    }
    const role = (user?.Role || user?.role || "").toUpperCase();
    if (role !== "ADMIN") {
      setError(`You do not have Admin privileges. Current role: "${user?.Role || user?.role || "None"}".`);
      setLoading(false);
      return;
    }
    // ok
  }, [user, token]);

  // ✅ Load counts (all/pending/approved) so tabs are always synced & correct
  const loadCounts = async () => {
    try {
      const [allProps, allTours, pendingProps, pendingTours] = await Promise.all([
        adminAPI.getAllProperties().catch(() => []),
        adminAPI.getAllTours().catch(() => []),
        adminAPI.getPendingProperties().catch(() => []),
        adminAPI.getPendingTours().catch(() => []),
      ]);

      const approvedCount =
        (allProps || []).filter(isActiveTrue).length + (allTours || []).filter(isActiveTrue).length;

      const pendingCount = (pendingProps?.length || 0) + (pendingTours?.length || 0);
      const allCount = (allProps?.length || 0) + (allTours?.length || 0);

      setCounts({ all: allCount, pending: pendingCount, approved: approvedCount });
    } catch {
      // ignore
    }
  };

  // ✅ Load list by filter (pending uses pending endpoints -> SAME as Dashboard)
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Refresh tab counts in background
      loadCounts();

      if (filter === "pending") {
        const [pendingProps, pendingTours] = await Promise.all([
          adminAPI.getPendingProperties().catch(() => []),
          adminAPI.getPendingTours().catch(() => []),
        ]);
        setProperties(pendingProps || []);
        setTours(pendingTours || []);
      } else {
        const [allProps, allTours] = await Promise.all([
          adminAPI.getAllProperties().catch(() => []),
          adminAPI.getAllTours().catch(() => []),
        ]);

        let props = allProps || [];
        let toursData = allTours || [];

        if (filter === "approved") {
          props = props.filter(isActiveTrue);
          toursData = toursData.filter(isActiveTrue);
        }

        setProperties(props);
        setTours(toursData);
      }
    } catch (err) {
      setError(err.message || "Unable to load posts list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    const role = (user?.Role || user?.role || "").toUpperCase();
    if (role !== "ADMIN") return;

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user, token]);

  const allItems = useMemo(
    () => [
      ...(properties || []).map((p) => ({ ...p, type: "property" })),
      ...(tours || []).map((t) => ({ ...t, type: "tour" })),
    ],
    [properties, tours]
  );

  // Actions
  const handleApprove = async (item) => {
    try {
      const id = getItemId(item);
      const type = getItemType(item);

      if (type === "property") await adminAPI.approveProperty(id);
      else await adminAPI.approveTour(id);

      success("Post approved successfully!");
      setShowModal(false);
      setSelectedItem(null);
      setRejectReason("");

      await loadData();   // ✅ reload list
      await loadCounts(); // ✅ refresh counts for sync
    } catch (err) {
      showError(err.message || "Unable to approve");
    }
  };

  const openRejectModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!selectedItem || rejecting) return;

    if (!rejectReason || rejectReason.trim().length === 0) {
      setRejectConfirm({ show: true, skipReason: true });
      return;
    }

    setRejectConfirm({ show: true, skipReason: false });
  };

  const confirmReject = async () => {
    if (!selectedItem || rejecting) return;
    try {
      setRejecting(true);
      const id = getItemId(selectedItem);
      const type = getItemType(selectedItem);

      if (type === "property") await adminAPI.rejectProperty(id, rejectReason || null);
      else await adminAPI.rejectTour(id, rejectReason || null);

      success("Post rejected successfully!");
      setShowModal(false);
      setSelectedItem(null);
      setRejectReason("");
      setRejectConfirm(null);

      await loadData();
      await loadCounts();
    } catch (err) {
      showError(err.message || "Unable to reject");
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = (item) => {
    setDeleteConfirm({
      itemId: getItemId(item),
      type: getItemType(item),
      itemTitle: getItemTitle(item),
      item,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { itemId, type } = deleteConfirm;

    try {
      setDeleting(true);
      setDeletingId(itemId);

      if (type === "property") await adminAPI.deleteProperty(itemId);
      else await adminAPI.deleteTour(itemId);

      success(`${type === "property" ? "Property" : "Tour"} deleted successfully!`);
      setDeleteConfirm(null);

      await loadData();
      await loadCounts();
    } catch (err) {
      showError(err.message || "Unable to delete");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  // UI states
  if (loading) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Posts list</div>
          <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Posts list</div>
          <div style={{ padding: 20, color: "#b91c1c" }}>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>Error: {error}</div>
            <div style={{ fontSize: 14, color: "#666" }}>
              Hint: check token + user Role = ADMIN, then logout/login again.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Filter Tabs (synced counts) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={filter === "all" ? "primary" : "ghost"} onClick={() => setFilter("all")}>
          All ({counts.all})
        </button>
        <button className={filter === "pending" ? "primary" : "ghost"} onClick={() => setFilter("pending")}>
          Pending ({counts.pending})
        </button>
        <button className={filter === "approved" ? "primary" : "ghost"} onClick={() => setFilter("approved")}>
          Approved ({counts.approved})
        </button>
      </div>

      <div className="table-card">
        <div className="table-title">
          Posts list ({allItems.length})
          <span style={{ fontSize: 14, fontWeight: "normal", color: "#666", marginLeft: 8 }}>
            ({properties.length} Properties, {tours.length} Tours)
          </span>
        </div>

        <div className="table">
          <div className="row head" data-columns="7">
            <div>Type</div>
            <div>ID</div>
            <div>Title</div>
            <div>Price</div>
            <div>Host</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {allItems.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>No data</div>
          ) : (
            allItems.map((item) => {
              const id = getItemId(item);
              const type = getItemType(item);

              // If we're in pending mode, everything is pending by definition.
              const isPending = filter === "pending" ? true : !isActiveTrue(item);

              return (
                <div key={`${type}-${id}`} className="row" data-columns="7">
                  <div>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        background: type === "property" ? "#e3f2fd" : "#f3e5f5",
                        color: type === "property" ? "#1976d2" : "#7b1fa2",
                      }}
                    >
                      {type === "property" ? "🏠" : "🎭"}
                    </span>
                  </div>

                  <div>{id}</div>
                  <div>{getItemTitle(item)}</div>

                  <div>
                    {formatPrice(item.Price || item.price, item.Currency || item.currency)}
                    {type === "property" ? "/đêm" : "/người"}
                  </div>

                  <div>Host #{item.HostID || item.hostID || "N/A"}</div>

                  <div>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        background: isPending ? "#fff3cd" : "#d4edda",
                        color: isPending ? "#856404" : "#155724",
                      }}
                    >
                      {isPending ? "PENDING" : "APPROVED"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(item)}
                          style={{
                            padding: "4px 8px",
                            background: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => openRejectModal(item)}
                          style={{
                            padding: "4px 8px",
                            background: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                          title="Reject"
                        >
                          ✕
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleting && deletingId === id}
                      style={{
                        padding: "4px 8px",
                        background: deleting && deletingId === id ? "#9ca3af" : "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: deleting && deletingId === id ? "not-allowed" : "pointer",
                        fontSize: 12,
                      }}
                      title="Delete permanently"
                    >
                      {deleting && deletingId === id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showModal && selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(2px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setSelectedItem(null);
              setRejectReason("");
            }
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              maxWidth: 500,
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,.1)",
              animation: "modalSlideIn .2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12, color: "#dc3545" }}>Reject post</h3>
            <div style={{ background: "#f9fafb", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                <b>Type:</b> {getItemType(selectedItem)}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                <b>ID:</b> {getItemId(selectedItem)}
              </div>
              <div style={{ fontSize: 14, color: "#111827" }}>
                <b>Title:</b> {getItemTitle(selectedItem)}
              </div>
            </div>

            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              Reason (optional):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: "100%",
                minHeight: 120,
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                resize: "vertical",
                fontSize: 14,
              }}
              placeholder="Enter rejection reason..."
              autoFocus
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
              <button className="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary" onClick={handleReject} disabled={rejecting}>
                {rejecting ? "Processing..." : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title={`Delete ${deleteConfirm.type === "property" ? "Property" : "Tour"}`}
          message={`Are you sure you want to PERMANENTLY DELETE this ${
            deleteConfirm.type === "property" ? "property" : "tour"
          }?`}
          details={{ Title: deleteConfirm.itemTitle, ID: deleteConfirm.itemId }}
          warning="WARNING: This action cannot be undone!"
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          loading={deleting && deletingId === deleteConfirm.itemId}
        />
      )}

      {/* Reject Confirmation */}
      {rejectConfirm && rejectConfirm.show && selectedItem && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setRejectConfirm(null)}
          onConfirm={() => {
            setRejectConfirm(null);
            confirmReject();
          }}
          title={rejectConfirm.skipReason ? "Continue Without Reason?" : "Confirm Rejection"}
          message={
            rejectConfirm.skipReason
              ? "You have not entered a reason. Continue rejecting?"
              : `Are you sure you want to reject "${getItemTitle(selectedItem)}"?`
          }
          confirmText="Confirm"
          cancelText="Cancel"
          type="warning"
          loading={rejecting}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
