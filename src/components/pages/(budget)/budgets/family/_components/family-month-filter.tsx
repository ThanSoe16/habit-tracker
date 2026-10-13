import { useState } from 'react';
import { Flex, Grid } from '@radix-ui/themes';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Field, FieldLabel } from '@/components/ui/field';
import styles from './family-filters.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type FamilyMonthFilterProps = {
  month: string;
  onChange: (value: string) => void;
};

export function FamilyMonthFilter({ month, onChange }: FamilyMonthFilterProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const label = month ? `${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}` : 'All months';

  function selectMonth(value: string) {
    onChange(value);
    setOpen(false);
  }

  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor="family-month">Month</FieldLabel>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setYear(month ? Number(month.slice(0, 4)) : new Date().getFullYear());
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id="family-month"
            type="button"
            variant="outline"
            className={styles.filterControl}
          >
            <span className={styles.controlValue}>
              <CalendarDays aria-hidden="true" />
              <span className="truncate">{label}</span>
            </span>
            <ChevronDown aria-hidden="true" data-icon="inline-end" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64" aria-label="Choose a month">
          <Flex align="center" justify="between" className={styles.yearNavigation}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous year"
              disabled={year <= 1}
              onClick={() => setYear((value) => value - 1)}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm font-semibold tabular-nums" aria-live="polite">
              {year}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next year"
              disabled={year >= 9999}
              onClick={() => setYear((value) => value + 1)}
            >
              <ChevronRight />
            </Button>
          </Flex>
          <Grid columns="3" gap="2" className={styles.monthGrid}>
            {MONTHS.map((name, index) => {
              const value = `${String(year).padStart(4, '0')}-${String(index + 1).padStart(2, '0')}`;
              return (
                <Button
                  key={name}
                  type="button"
                  variant={month === value ? 'default' : 'ghost'}
                  aria-label={`${name} ${year}`}
                  aria-pressed={month === value}
                  onClick={() => selectMonth(value)}
                >
                  {name}
                </Button>
              );
            })}
          </Grid>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => selectMonth('')}
          >
            All months
          </Button>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
