"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Skeleton,
  SkeletonButton,
  SkeletonBadge,
} from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, Check, X } from "lucide-react";
import apiService from "@/lib/apiService";
import { useToast } from "@/hooks/useToast";
import EvaluationsPagination from "@/components/paginationComponent";

interface SignatureResetRequest {
  id: number;
  user_id?: number;
  user: {
    id?: number;
    fname: string;
    lname: string;
    email: string;
    username: string;
    position?: string;
    department?: string;
    branch?: string;
  };
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  processed_at?: string;
  processed_by?: number;
}

export default function SignatureResetRequestsTab() {
  const [requests, setRequests] = useState<SignatureResetRequest[]>([]);
  const [refresh, setRefresh] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState("0"); // Default to "All Requests"
  const [debouncedStatusFilter, setDebouncedStatusFilter] =
    useState(statusFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<SignatureResetRequest | null>(null);

  const { success, error: showError } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Date filter options for combobox
  const statusOptions = [
    { value: "0", label: "All Requests" },
    { value: "new", label: "New" },
    { value: "recent", label: "Recent" },
    { value: "old", label: "Old" },
  ];

  const loadRequests = async (
    searchValue: string,
    statusFilterValue: string,
    isPageChange: boolean = false
  ) => {
    try {
      if (isPageChange) {
        setIsPageLoading(true);
      }
      const response = await apiService.getSignatureResetRequests(searchValue);

      // Handle different response structures
      let allRequests: SignatureResetRequest[] = [];

      if (response) {
        // If response has data property (paginated response)
        if (response.data && Array.isArray(response.data)) {
          allRequests = response.data;
        } else if (Array.isArray(response)) {
          // If response is a plain array
          allRequests = response;
        }
      }

      // Apply client-side filtering
      let filteredRequests = allRequests;

      // Filter by search term
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        filteredRequests = filteredRequests.filter((request) => {
          const fullName = `${request.user?.fname || ""} ${
            request.user?.lname || ""
          }`.toLowerCase();
          const email = request.user?.email?.toLowerCase() || "";
          const username = request.user?.username?.toLowerCase() || "";
          return (
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            username.includes(searchLower)
          );
        });
      }

      // Filter by date (convert "0" to empty string for "All Requests")
      const dateFilterForFiltering =
        statusFilterValue === "0" ? "" : statusFilterValue;
      if (dateFilterForFiltering) {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        filteredRequests = filteredRequests.filter((request) => {
          if (!request.requested_at) return false;
          const requestDate = new Date(request.requested_at);
          const requestDateOnly = new Date(
            requestDate.getFullYear(),
            requestDate.getMonth(),
            requestDate.getDate()
          );

          switch (dateFilterForFiltering) {
            case "new":
              // New: Today's requests
              return requestDateOnly.getTime() === today.getTime();
            case "recent":
              // Recent: Last 7 days (including today)
              return requestDate >= oneWeekAgo && requestDate <= now;
            case "old":
              // Old: Older than 7 days
              return requestDate < oneWeekAgo;
            default:
              return true;
          }
        });
      }

      // Apply client-side pagination
      const total = filteredRequests.length;
      const lastPage = Math.ceil(total / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      setRequests(paginatedRequests);
      setTotalItems(total);
      setTotalPages(lastPage);
      setPerPage(itemsPerPage);
    } catch (err) {
      console.error("Error loading signature reset requests:", err);
      showError("Failed to load signature reset requests");
    } finally {
      setRefresh(false);
      if (isPageChange) {
        setIsPageLoading(false);
      }
    }
  };

  useEffect(() => {
    const mount = async () => {
      setRefresh(true);
      try {
        await loadRequests(searchTerm, statusFilter);
      } catch (err) {
        console.error(err);
        setRefresh(false);
      }
    };
    mount();
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Debounce status filter
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStatusFilter(statusFilter);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [statusFilter]);

  // Load data when filters or page changes
  useEffect(() => {
    const fetchData = async () => {
      const isPageChange =
        debouncedSearchTerm === searchTerm &&
        debouncedStatusFilter === statusFilter;
      await loadRequests(
        debouncedSearchTerm,
        debouncedStatusFilter,
        isPageChange
      );
    };
    fetchData();
  }, [debouncedSearchTerm, debouncedStatusFilter, currentPage]);

  const handleRefresh = async () => {
    setRefresh(true);
    await loadRequests(debouncedSearchTerm, debouncedStatusFilter);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    // The API returns user objects directly, so the user ID is in the id field
    const userId =
      (selectedRequest as any).id ||
      selectedRequest.user_id ||
      selectedRequest.user?.id;

    if (!userId) {
      console.error(
        "User ID not found. Full request object:",
        JSON.stringify(selectedRequest, null, 2)
      );
      showError("User ID not found in request data.");
      return;
    }

    try {
      await apiService.approveSignatureReset(userId);
      success("Signature reset request approved successfully!");
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      await loadRequests(debouncedSearchTerm, debouncedStatusFilter);
    } catch (err: any) {
      console.error("Error approving request:", err);
      showError(err.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    // The API returns user objects directly, so the user ID is in the id field
    const userId =
      (selectedRequest as any).id ||
      selectedRequest.user_id ||
      selectedRequest.user?.id;

    if (!userId) {
      console.error(
        "User ID not found. Full request object:",
        JSON.stringify(selectedRequest, null, 2)
      );
      showError("User ID not found in request data.");
      return;
    }

    try {
      await apiService.rejectSignatureReset(userId);
      success("Signature reset request rejected successfully!");
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      await loadRequests(debouncedSearchTerm, debouncedStatusFilter);
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      showError(err.response?.data?.message || "Failed to reject request");
    }
  };

  const openApproveModal = (request: SignatureResetRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (request: SignatureResetRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative overflow-y-auto pr-2 min-h-[400px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Signature Reset Requests</CardTitle>
              <CardDescription>
                Manage signature reset requests from users
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refresh}
              className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white hover:text-white border-blue-600 hover:border-green-700 cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 ${refresh ? "animate-spin" : ""}`}
              />
              <span className="cursor-pointer">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-1/3"
              />
            </div>
            <Combobox
              options={statusOptions}
              value={statusFilter}
              onValueChangeAction={(value) => setStatusFilter(value as string)}
              placeholder="All Requests"
              searchPlaceholder="Search status..."
              emptyText="No status found."
              className="w-[180px] cursor-pointer"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6">User</TableHead>
                  <TableHead className="w-1/6">Email</TableHead>
                  <TableHead className="w-1/6">Position</TableHead>
                  <TableHead className="w-1/6">Department</TableHead>
                  <TableHead className="w-1/6">Branch</TableHead>
                  <TableHead className="w-1/6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refresh || isPageLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <SkeletonButton size="sm" className="w-24" />
                          <SkeletonButton size="sm" className="w-24" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <img
                          src="/not-found.gif"
                          alt="No data"
                          className="w-25 h-25 object-contain"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                          onDrag={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                          onDragEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                          onMouseDown={(e) => {
                            // Prevent default behavior on mouse down to prevent dragging
                            if (e.button === 0) {
                              // Left mouse button
                              e.preventDefault();
                            }
                          }}
                          style={
                            {
                              imageRendering: "auto",
                              willChange: "auto",
                              transform: "translateZ(0)",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                            } as React.CSSProperties
                          }
                        />
                        <div className="text-gray-500">
                          {searchTerm || statusFilter !== "0" ? (
                            <>
                              <p className="text-base font-medium mb-1">
                                No signature reset requests found
                              </p>
                              <p className="text-sm">
                                Try adjusting your search or date filter
                                criteria
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-base font-medium mb-1">
                                No signature reset requests
                              </p>
                              <p className="text-sm">
                                Requests will appear here when users request
                                signature resets
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.fname} {request.lname}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{request.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        {request.positions?.label || request.position || "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.departments?.department_name ||
                          request.department ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.branches?.length > 0
                          ? request.branches
                              .map((b: any) => b.branch_name || b.name)
                              .join(", ")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApproveModal(request)}
                            className="text-green-600 border-green-300 hover:bg-green-50 cursor-pointer bg-green-600 hover:bg-green-700 text-white hover:text-white hover:bg-green-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectModal(request)}
                            className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer bg-red-600 hover:bg-red-700 text-white hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject Request
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <EvaluationsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={totalItems}
                perPage={perPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Modal */}
      <Dialog
        open={isApproveModalOpen}
        onOpenChangeAction={setIsApproveModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Signature Reset Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the signature reset request for{" "}
              <strong>
                {selectedRequest?.user?.fname} {selectedRequest?.user?.lname}
              </strong>
              ? This will allow them to clear their signature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
              className="cursor-pointer bg-blue-600 hover:bg-red-700 text-white hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsApproving(true);

                try {
                  await handleApprove();
                } finally {
                  setIsApproving(false);
                }
              }}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700 cursor-pointer flex items-center gap-2 hover:text-white hover:bg-green-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              {isApproving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog
        open={isRejectModalOpen}
        onOpenChangeAction={setIsRejectModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Signature Reset Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the signature reset request for{" "}
              <strong>
                {selectedRequest?.user?.fname} {selectedRequest?.user?.lname}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              className="cursor-pointer bg-blue-600 hover:bg-red-700 text-white hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsRejecting(true);

                try {
                  await handleReject();
                } finally {
                  setIsRejecting(false);
                }
              }}
              disabled={isRejecting}
              variant="destructive"
              className="cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              {isRejecting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
