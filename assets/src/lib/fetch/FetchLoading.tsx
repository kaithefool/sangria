import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { useFetch } from './useFetch'

export default function FetchLoading() {
  const { status, fetched } = useFetch()

  if (status !== 'pending' || fetched === null) return ''
  return (
    <div className="position-absolute w-100 h-100">
      <div className="position-absolute w-100 h-100 body-bg opacity-25"></div>
      <div className="text-center">
        <FA icon={faSpinner} />
      </div>
    </div>
  )
}
