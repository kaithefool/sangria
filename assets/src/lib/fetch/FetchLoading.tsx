import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { useFetch } from './useFetch'

export default function FetchLoading() {
  const { status, fetched } = useFetch()

  if (status !== 'pending' || fetched === null) return ''
  return (
    <div className="position-absolute">
      <div>
        <FA icon={faSpinner} />
      </div>
    </div>
  )
}
