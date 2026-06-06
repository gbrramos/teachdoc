import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppHeader from "~/components/AppHeader";
import Button from "~/components/Button";
import CheckIcon from "~/components/CheckIcon";
import CopyIcon from "~/components/CopyIcon";
import { getRoom, type Room } from "~/services/room-service";
import { createDocument, getDocumentsByRoom, reviewDocument, submitDocument, updateDocument, type Document, type DocumentStatus } from "~/services/document-service";
import { useAuth } from "~/hooks/useAuth";
import {Editor} from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

const OWNER_STATUS_FILTERS: Array<{ value: "ALL" | DocumentStatus; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "CHANGES_REQUESTED", label: "Ajustes solicitados" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "DRAFT", label: "Rascunhos" },
];


export function meta() {
  return [{ title: "TeachDoc - Room" }];
}

export default function RoomDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocumentContent, setNewDocumentContent] = useState("");
  const [newDocumentMode, setNewDocumentMode] = useState<"DRAFT" | "PENDING">("DRAFT");
  const [submittingDocument, setSubmittingDocument] = useState(false);
  const [savingReviewId, setSavingReviewId] = useState<number | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEditId, setSavingEditId] = useState<number | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, { status: DocumentStatus; teacherNotes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedDocumentId, setCopiedDocumentId] = useState<number | null>(null);
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<"ALL" | DocumentStatus>("ALL");
  const [ownerStudentFilter, setOwnerStudentFilter] = useState<number | "ALL">("ALL");
  const [selectedOwnerDocumentId, setSelectedOwnerDocumentId] = useState<number | null>(null);
  const editorRef = useRef<TinyMCEEditor | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionStorage.getItem("token")) {
      navigate("/");
      return;
    }

    const roomId = Number(id);
    if (!Number.isInteger(roomId) || roomId <= 0) {
      setError("Código de sala inválido.");
      setLoading(false);
      return;
    }

    loadRoomData(roomId);
  }, [id, navigate]);

  async function loadRoomData(roomId: number) {
    try {
      setLoading(true);
      setError("");
      const [roomData, roomDocuments] = await Promise.all([
        getRoom(roomId),
        getDocumentsByRoom(roomId),
      ]);

      setRoom(roomData);
      setDocuments(roomDocuments);
      setReviewDrafts(
        Object.fromEntries(
          roomDocuments.map((document) => [
            document.id,
            {
              status: document.status,
              teacherNotes: document.teacherNotes ?? "",
            },
          ])
        )
      );
    } catch {
      setError("Não foi possível carregar as informações da sala.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!room || user?.role !== "STUDENT") return;
    if (!newDocumentContent.trim()) {
      setError("O conteúdo do documento é obrigatório.");
      return;
    }

    setSubmittingDocument(true);
    setError("");

    try {
      const created = await createDocument(room.id, newDocumentContent.trim(), newDocumentMode);
      setDocuments((prev) => [created, ...prev]);
      setReviewDrafts((prev) => ({
        ...prev,
        [created.id]: { status: created.status, teacherNotes: created.teacherNotes ?? "" },
      }));
      setNewDocumentContent("");
      setNewDocumentMode("DRAFT");
    } catch {
      setError("Não foi possível enviar o documento para validação.");
    } finally {
      setSubmittingDocument(false);
    }
  }

  async function handleSaveDraftEdit(documentId: number) {
    if (!isStudent || !editContent.trim()) {
      setError("O conteúdo do documento é obrigatório.");
      return;
    }

    setSavingEditId(documentId);
    setError("");

    try {
      const updated = await updateDocument(documentId, editContent.trim());
      setDocuments((prev) => prev.map((d) => (d.id === documentId ? updated : d)));
      setEditingDraftId(null);
      setEditContent("");
    } catch {
      setError("Não foi possível salvar as alterações do rascunho.");
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleSubmitDraft(documentId: number) {
    if (!isStudent) return;

    setSavingReviewId(documentId);
    setError("");

    try {
      const updated = await submitDocument(documentId);
      setDocuments((prev) => prev.map((document) => (document.id === documentId ? updated : document)));
      setReviewDrafts((prev) => ({
        ...prev,
        [documentId]: {
          status: updated.status,
          teacherNotes: updated.teacherNotes ?? "",
        },
      }));
    } catch {
      setError("Não foi possível enviar o rascunho para validação.");
    } finally {
      setSavingReviewId(null);
    }
  }

  async function handleSaveReview(documentId: number) {
    if (!room || Number(user?.id) !== room.owner.id) return;

    const draft = reviewDrafts[documentId];
    if (!draft) return;

    if (draft.status === "CHANGES_REQUESTED" && !draft.teacherNotes.trim()) {
      setError("Adicione anotações para solicitar ajustes no documento.");
      return;
    }

    setSavingReviewId(documentId);
    setError("");

    try {
      const updated = await reviewDocument(documentId, draft.status, draft.teacherNotes);
      setDocuments((prev) => prev.map((document) => (document.id === documentId ? updated : document)));
      setReviewDrafts((prev) => ({
        ...prev,
        [documentId]: {
          status: updated.status,
          teacherNotes: updated.teacherNotes ?? "",
        },
      }));
    } catch {
      setError("Não foi possível salvar a validação do documento.");
    } finally {
      setSavingReviewId(null);
    }
  }

  function getStatusLabel(status: DocumentStatus) {
    if (status === "DRAFT") return "Rascunho";
    if (status === "APPROVED") return "Aprovado";
    if (status === "CHANGES_REQUESTED") return "Ajustes solicitados";
    return "Pendente";
  }

  function getStatusBadgeClass(status: DocumentStatus) {
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "CHANGES_REQUESTED") return "bg-amber-100 text-amber-700";
    if (status === "DRAFT") return "bg-gray-100 text-gray-700";
    return "bg-blue-100 text-blue-700";
  }

  function getPreviewText(html: string, maxLength = 140) {
    const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!plain) return "Sem conteúdo";
    return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain;
  }

  async function handleCopyDocumentContent(documentId: number, htmlContent: string) {
    if (typeof window === "undefined" || !navigator.clipboard) {
      setError("Seu navegador não suporta cópia automática.");
      return;
    }

    try {
      const temporaryContainer = window.document.createElement("div");
      temporaryContainer.innerHTML = htmlContent;
      const plainText = temporaryContainer.textContent?.trim() ?? "";
      const canWriteRichContent = typeof window.ClipboardItem !== "undefined" && typeof navigator.clipboard.write === "function";

      if (canWriteRichContent) {
        const clipboardItem = new window.ClipboardItem({
          "text/html": new Blob([htmlContent], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopiedDocumentId(documentId);
      window.setTimeout(() => {
        setCopiedDocumentId((current) => (current === documentId ? null : current));
      }, 2000);
    } catch {
      setError("Não foi possível copiar o conteúdo do documento.");
    }
  }

  const isStudent = user?.role === "STUDENT";
  const isRoomOwner = !!room && Number(user?.id) === room.owner.id;
  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [documents]
  );

  const ownerStudents = useMemo(() => {
    const uniqueStudents = new Map<number, string>();
    for (const document of sortedDocuments) {
      if (!uniqueStudents.has(document.student.id)) {
        uniqueStudents.set(document.student.id, document.student.name);
      }
    }
    return Array.from(uniqueStudents.entries()).map(([id, name]) => ({ id, name }));
  }, [sortedDocuments]);

  const ownerStatusSummary = useMemo(
    () =>
      sortedDocuments.reduce(
        (acc, document) => {
          acc[document.status] += 1;
          return acc;
        },
        {
          DRAFT: 0,
          PENDING: 0,
          APPROVED: 0,
          CHANGES_REQUESTED: 0,
        } as Record<DocumentStatus, number>
      ),
    [sortedDocuments]
  );

  const ownerFilteredDocuments = useMemo(
    () =>
      sortedDocuments.filter((document) => {
        const statusMatches = ownerStatusFilter === "ALL" || document.status === ownerStatusFilter;
        const studentMatches = ownerStudentFilter === "ALL" || document.student.id === ownerStudentFilter;
        return statusMatches && studentMatches;
      }),
    [ownerStatusFilter, ownerStudentFilter, sortedDocuments]
  );

  useEffect(() => {
    if (!isRoomOwner) return;

    if (!ownerFilteredDocuments.length) {
      setSelectedOwnerDocumentId(null);
      return;
    }

    const selectedStillVisible = ownerFilteredDocuments.some((document) => document.id === selectedOwnerDocumentId);
    if (!selectedStillVisible) {
      setSelectedOwnerDocumentId(ownerFilteredDocuments[0].id);
    }
  }, [isRoomOwner, ownerFilteredDocuments, selectedOwnerDocumentId]);

  const selectedOwnerDocument = ownerFilteredDocuments.find((document) => document.id === selectedOwnerDocumentId) ?? null;

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader
        userName={user?.name}
        actionLabel="Voltar"
        onAction={() => navigate("/home")}
      />

      <main className={`${isRoomOwner ? "max-w-6xl" : "max-w-3xl"} mx-auto py-10 px-4`}>
        {loading ? (
          <p className="text-gray-500">Carregando informações da sala...</p>
        ) : error ? (
          <div className="bg-white rounded shadow p-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button type="button" onClick={() => navigate("/home")}>Ir para salas</Button>
          </div>
        ) : room ? (
          <div className="space-y-6">
            <section className="bg-white rounded shadow p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Sala #{room.id}</p>
                <h2 className="text-2xl font-bold text-gray-800">{room.name}</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Professor responsável</p>
                  <p className="text-gray-800 font-medium">{room.owner.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-mail do professor</p>
                  <p className="text-gray-800 font-medium">{room.owner.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Criada em</p>
                  <p className="text-gray-800 font-medium">{new Date(room.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última atualização</p>
                  <p className="text-gray-800 font-medium">{new Date(room.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </section>

            {isStudent && (
              <section className="bg-white rounded shadow p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Enviar documento para validação</h3>
                <form onSubmit={handleCreateDocument} className="space-y-3 text-black">
                  <Editor
                      apiKey='1uv4e5j5adn8fj0sgsjp3p15xv1un444zrxvma0h93okescs'
                      onInit={ (_evt, editor) => editorRef.current = editor }
                      onInput={() => setNewDocumentContent(editorRef.current?.getContent() || "")}
                      initialValue="<p></p>"
                      init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                      }}
                  />
                  <div className="flex gap-2">
                    <Button
                        type="submit"
                        variant="secondary"
                        onClick={() => setNewDocumentMode("DRAFT")}
                    >
                      {submittingDocument && newDocumentMode === "DRAFT" ? "Salvando..." : "Salvar rascunho"}
                    </Button>
                    <Button
                        type="submit"
                        onClick={() => setNewDocumentMode("PENDING")}
                    >
                      {submittingDocument && newDocumentMode === "PENDING" ? "Enviando..." : "Enviar para validação"}
                    </Button>
                  </div>
                </form>
              </section>
            )}

            <section className="bg-white rounded shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Documentos da sala</h3>
              {documents.length === 0 ? (
                <p className="text-gray-500">Nenhum documento enviado nesta sala.</p>
              ) : isRoomOwner ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-2xl font-semibold text-gray-800">{documents.length}</p>
                    </div>
                    <div className="rounded border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700">Pendentes</p>
                      <p className="text-2xl font-semibold text-blue-800">{ownerStatusSummary.PENDING}</p>
                    </div>
                    <div className="rounded border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">Ajustes solicitados</p>
                      <p className="text-2xl font-semibold text-amber-800">{ownerStatusSummary.CHANGES_REQUESTED}</p>
                    </div>
                    <div className="rounded border border-green-200 bg-green-50 p-3">
                      <p className="text-xs text-green-700">Aprovados</p>
                      <p className="text-2xl font-semibold text-green-800">{ownerStatusSummary.APPROVED}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                      value={ownerStatusFilter}
                      onChange={(e) => setOwnerStatusFilter(e.target.value as "ALL" | DocumentStatus)}
                    >
                      {OWNER_STATUS_FILTERS.map((statusFilter) => (
                        <option key={statusFilter.value} value={statusFilter.value}>
                          Status: {statusFilter.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                      value={String(ownerStudentFilter)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setOwnerStudentFilter(value === "ALL" ? "ALL" : Number(value));
                      }}
                    >
                      <option value="ALL">Aluno: todos</option>
                      {ownerStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          Aluno: {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {ownerFilteredDocuments.length === 0 ? (
                    <p className="text-gray-500">Nenhum documento com os filtros selecionados.</p>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                      <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                        {ownerFilteredDocuments.map((document) => (
                          <button
                            key={document.id}
                            type="button"
                            className={`w-full text-left rounded border p-3 transition ${
                              selectedOwnerDocumentId === document.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => setSelectedOwnerDocumentId(document.id)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-gray-800 truncate">{document.student.name}</p>
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeClass(document.status)}`}>
                                {getStatusLabel(document.status)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Atualizado em {new Date(document.updatedAt).toLocaleString()}</p>
                            <p className="text-sm text-gray-600 mt-2">{getPreviewText(document.content)}</p>
                          </button>
                        ))}
                      </div>

                      {selectedOwnerDocument ? (() => {
                        const draft = reviewDrafts[selectedOwnerDocument.id] ?? {
                          status: selectedOwnerDocument.status,
                          teacherNotes: selectedOwnerDocument.teacherNotes ?? "",
                        };
                        const isApproved = selectedOwnerDocument.status === "APPROVED";

                        return (
                          <article className="rounded border border-gray-200 p-4 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-gray-500">Aluno</p>
                                <p className="font-medium text-gray-800">{selectedOwnerDocument.student.name}</p>
                              </div>
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeClass(selectedOwnerDocument.status)}`}>
                                {getStatusLabel(selectedOwnerDocument.status)}
                              </span>
                            </div>

                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-500">Conteúdo do documento</p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  aria-label={copiedDocumentId === selectedOwnerDocument.id ? "Conteúdo copiado" : "Copiar conteúdo"}
                                  title={copiedDocumentId === selectedOwnerDocument.id ? "Conteúdo copiado" : "Copiar conteúdo"}
                                  onClick={() => handleCopyDocumentContent(selectedOwnerDocument.id, selectedOwnerDocument.content)}
                                >
                                  {copiedDocumentId === selectedOwnerDocument.id ? <CheckIcon /> : <CopyIcon />}
                                </Button>
                              </div>
                              <div className="rounded border border-gray-100 bg-gray-50 p-3 text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedOwnerDocument.content }} />
                            </div>

                            <p className="text-xs text-gray-500">
                              Enviado em {new Date(selectedOwnerDocument.createdAt).toLocaleString()} - Última atualização {new Date(selectedOwnerDocument.updatedAt).toLocaleString()}
                            </p>

                            <div className="space-y-2 border-t border-gray-100 pt-3">
                              <p className="text-sm font-medium text-gray-700">Validação do professor</p>
                              <select
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                                value={draft.status}
                                disabled={isApproved}
                                onChange={(e) => {
                                  const status = e.target.value as DocumentStatus;
                                  setReviewDrafts((prev) => ({
                                    ...prev,
                                    [selectedOwnerDocument.id]: {
                                      ...draft,
                                      status,
                                    },
                                  }));
                                }}
                              >
                                <option value="PENDING">Pendente</option>
                                <option value="APPROVED">Aprovado</option>
                                <option value="CHANGES_REQUESTED">Solicitar ajustes</option>
                              </select>
                              <Editor
                                apiKey='1uv4e5j5adn8fj0sgsjp3p15xv1un444zrxvma0h93okescs'
                                value={draft.teacherNotes}
                                disabled={isApproved}
                                init={{
                                  height: 220,
                                  menubar: false,
                                  plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'charmap',
                                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'table', 'preview', 'wordcount',
                                  ],
                                  toolbar: 'undo redo | bold italic forecolor | bullist numlist | removeformat',
                                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                }}
                                onEditorChange={(content) => {
                                  setReviewDrafts((prev) => ({
                                    ...prev,
                                    [selectedOwnerDocument.id]: {
                                      ...draft,
                                      teacherNotes: content,
                                    },
                                  }));
                                }}
                              />

                              <Button
                                type="button"
                                disabled={savingReviewId === selectedOwnerDocument.id || isApproved}
                                onClick={() => handleSaveReview(selectedOwnerDocument.id)}
                              >
                                {savingReviewId === selectedOwnerDocument.id ? "Salvando..." : "Salvar validação"}
                              </Button>
                              {isApproved && (
                                <p className="text-xs text-gray-500">Documento aprovado: validação bloqueada para alterações.</p>
                              )}
                            </div>
                          </article>
                        );
                      })() : null}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedDocuments.map((document) => {
                    return (
                      <article key={document.id} className="rounded border border-gray-200 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Aluno</p>
                            <p className="font-medium text-gray-800">{document.student.name}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeClass(document.status)}`}>
                            {getStatusLabel(document.status)}
                          </span>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-sm text-gray-500">Conteúdo</p>
                            <Button
                              type="button"
                              variant="ghost"
                              aria-label={copiedDocumentId === document.id ? "Conteúdo copiado" : "Copiar conteúdo"}
                              title={copiedDocumentId === document.id ? "Conteúdo copiado" : "Copiar conteúdo"}
                              onClick={() => handleCopyDocumentContent(document.id, document.content)}
                            >
                              {copiedDocumentId === document.id ? <CheckIcon /> : <CopyIcon />}
                            </Button>
                          </div>
                          {isStudent && Number(user?.id) === document.studentId && document.status === "DRAFT" && editingDraftId === document.id ? (
                            <div className="space-y-2 mt-1">
                              <Editor
                                apiKey='1uv4e5j5adn8fj0sgsjp3p15xv1un444zrxvma0h93okescs'
                                initialValue={document.content}
                                init={{
                                  height: 400,
                                  menubar: false,
                                  plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'charmap',
                                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'preview', 'wordcount',
                                  ],
                                  toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                }}
                                onEditorChange={(content) => setEditContent(content)}
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  disabled={savingEditId === document.id}
                                  onClick={() => handleSaveDraftEdit(document.id)}
                                >
                                  {savingEditId === document.id ? "Salvando..." : "Salvar alterações"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => { setEditingDraftId(null); setEditContent(""); }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: document.content }}></p>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          Enviado em {new Date(document.createdAt).toLocaleString()}
                        </p>

                        {isStudent && Number(user?.id) === document.studentId && document.status === "DRAFT" && (
                          <div className="flex gap-2">
                            {editingDraftId !== document.id && (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => { setEditingDraftId(document.id); setEditContent(document.content); }}
                              >
                                Editar rascunho
                              </Button>
                            )}
                            <Button
                              type="button"
                              disabled={savingReviewId === document.id}
                              onClick={() => handleSubmitDraft(document.id)}
                            >
                              {savingReviewId === document.id ? "Enviando..." : "Enviar rascunho para validação"}
                            </Button>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-500">Anotações do professor</p>
                          {document.teacherNotes ? (
                            <div className="text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: document.teacherNotes }} />
                          ) : (
                            <p className="text-gray-800 whitespace-pre-wrap">Sem anotações no momento.</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

