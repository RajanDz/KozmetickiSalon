import { useTranslation } from 'react-i18next'
import { status as statusTokens, StatusKey } from '../../design-system/tokens'

interface Props {
  status: StatusKey
}

export default function StatusBadge({ status }: Props) {
  const { t } = useTranslation()
  const s = statusTokens[status]

  return (
    <span className={`badge ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(`status.${status}`)}
    </span>
  )
}
