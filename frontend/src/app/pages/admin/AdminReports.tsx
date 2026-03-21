import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeLabels: Record<string, string> = {
  removal_request: 'Удаление данных',
  complaint: 'Жалоба',
  incorrect_data: 'Неверные данные',
  other: 'Другое',
};

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  reviewed: 'Рассмотрено',
  resolved: 'Решено',
  rejected: 'Отклонено',
};

export function AdminReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.adminListReports(
        0, 100,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setReports(data);
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: number, status: string) => {
    try {
      await api.adminUpdateReportStatus(reportId, status);
      toast.success(t('updateSuccess'));
      loadReports();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Жалобы и запросы</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="pending">На рассмотрении</SelectItem>
            <SelectItem value="reviewed">Рассмотрено</SelectItem>
            <SelectItem value="resolved">Решено</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400 py-8">{t('loading')}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">Тип</TableHead>
                <TableHead className="text-zinc-400">Имя</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Сообщение</TableHead>
                <TableHead className="text-zinc-400">Дата</TableHead>
                <TableHead className="text-zinc-400">Статус</TableHead>
                <TableHead className="text-zinc-400">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-white">{report.id}</TableCell>
                  <TableCell>
                    <span className="text-zinc-300 text-sm">
                      {typeLabels[report.type] || report.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">{report.name}</TableCell>
                  <TableCell className="text-zinc-400 text-sm">{report.email}</TableCell>

                  {/* Сообщение с кнопкой просмотра */}
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300 text-sm truncate">
                        {report.message}
                      </span>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-shrink-0 text-zinc-500 hover:text-white transition-colors"
                        title="Просмотреть полностью"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border ${statusColors[report.status]}`}>
                      {statusLabels[report.status] || report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={report.status}
                      onValueChange={(value) => handleStatusChange(report.id, value)}
                    >
                      <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="pending">На рассмотрении</SelectItem>
                        <SelectItem value="reviewed">Рассмотрено</SelectItem>
                        <SelectItem value="resolved">Решено</SelectItem>
                        <SelectItem value="rejected">Отклонено</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Диалог просмотра полного сообщения */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Жалоба #{selectedReport?.id}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Тип</p>
                  <p className="text-white text-sm">{typeLabels[selectedReport.type] || selectedReport.type}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Статус</p>
                  <Badge className={`border ${statusColors[selectedReport.status]}`}>
                    {statusLabels[selectedReport.status]}
                  </Badge>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Имя</p>
                  <p className="text-white text-sm">{selectedReport.name}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-zinc-500 text-xs mb-1">Email</p>
                  <p className="text-white text-sm">{selectedReport.email}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 col-span-2">
                  <p className="text-zinc-500 text-xs mb-1">Дата</p>
                  <p className="text-white text-sm">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-zinc-500 text-xs mb-2">Сообщение</p>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedReport.message}
                </p>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedReport.status}
                  onValueChange={(value) => {
                    handleStatusChange(selectedReport.id, value);
                    setSelectedReport({ ...selectedReport, status: value });
                  }}
                >
                  <SelectTrigger className="flex-1 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="pending">На рассмотрении</SelectItem>
                    <SelectItem value="reviewed">Рассмотрено</SelectItem>
                    <SelectItem value="resolved">Решено</SelectItem>
                    <SelectItem value="rejected">Отклонено</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="border-zinc-700"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}