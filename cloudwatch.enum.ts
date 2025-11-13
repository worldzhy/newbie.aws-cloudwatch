export enum CloudwatchMetricStatistics {
  AVERAGE = 'Average',
  MINIMUM = 'Minimum',
  MAXIMUM = 'Maximum',
  SUM = 'Sum',
  SAMPLE_COUNT = 'SampleCount',
}

export enum CloudwatchMetricMemoryMetricName {
  MEM_USED_PERCENT = 'mem_used_percent',
  MEM_USED = 'mem_used',
  MEM_FREE = 'mem_free',
  MEM_CACHED = 'mem_cached',
  MEM_BUFFERED = 'mem_buffered',
}

export enum CloudwatchMetricDiskMetricName {
  DISK_USED_PERCENT = 'disk_used_percent',
  DISK_USED = 'disk_used',
  DISK_FREE = 'disk_free',
  DISK_INODES_FREE = 'disk_inodes_free',
  DISK_INODES_USED = 'disk_inodes_used',
}

export enum CloudwatchMetricUnit {
  PERCENT = 'Percent',
  BYTES = 'Bytes',
}

export enum CloudwatchMetricRDSMetricName {
  CPU_UTILIZATION = 'CPUUtilization',
  FREEABLE_MEMORY = 'FreeableMemory',
  FREE_STORAGE_SPACE = 'FreeStorageSpace',
  DATABASE_CONNECTIONS = 'DatabaseConnections',
  DISK_INODES_USED = 'disk_inodes_used',
  READ_IOPS = 'ReadIOPS',
  WRITE_IOPS = 'WriteIOPS',
  READ_LATENCY = 'ReadLatency',
  WRITE_LATENCY = 'WriteLatency',
}
