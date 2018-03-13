<script>
import { Line, mixins } from 'vue-chartjs'

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['chartData'],
  mounted () {
    this.renderChart({labels: this.chartData.labels, datasets: this.chartData.datasets}, this.chartData.options)
  }
}
</script>
