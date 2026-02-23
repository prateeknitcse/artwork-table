import React, { useEffect, useRef, useState } from 'react';
import { DataTable, DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useFetchArtworks } from './hooks/useFetchArtworks';
import { Artwork } from './types';
import './App.css';

const ROWS_PER_PAGE = 12;

export default function App(){
  const { artworks, totalRecords, loading, fetchPage } = useFetchArtworks();
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [pendingSelectCount, setPendingSelectCount] = useState<number>(0);
  const [pendingSelectedSoFar, setPendingSelectedSoFar] = useState<number>(0);

  const overlayRef = useRef<OverlayPanel>(null);
  const [selectCountInput, setSelectCountInput] = useState('');

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage, fetchPage]);

  useEffect(() => {
    if (pendingSelectCount > 0 && artworks.length > 0) {
      const remaining = pendingSelectCount - pendingSelectedSoFar;
      if (remaining <= 0) return;

      const toSelect = artworks.slice(0, remaining);

      setSelectedIds(prev => {
        const next = new Set(prev);
        toSelect.forEach(a => next.add(a.id));
        return next;
      });

      setPendingSelectedSoFar(prev => {
        const newTotal = prev + toSelect.length;
        if (newTotal >= pendingSelectCount) {
          setPendingSelectCount(0);
        }
        return newTotal;
      });
    }
  }, [artworks, pendingSelectCount]);

  const selectedRowsOnPage = artworks.filter(a => selectedIds.has(a.id));

  const handlePageChange = (e: DataTablePageEvent) => {
    const newPage = (e.page ?? 0) + 1;
    setCurrentPage(newPage);
  };

  const handleSelectionChange = (
    e: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ) => {
    const currentPageSelectedIds = new Set((e.value as Artwork[]).map(a => a.id));
    const currentPageAllIds = new Set(artworks.map(a => a.id));

    setSelectedIds(prev => {
      const next = new Set(prev);
      currentPageAllIds.forEach(id => next.delete(id));
      currentPageSelectedIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleCustomSelect = () => {
    const count = parseInt(selectCountInput, 10);
    if (!count || count <= 0) return;

    setSelectedIds(new Set());
    setPendingSelectedSoFar(0);
    setPendingSelectCount(count);

    setCurrentPage(1);
    overlayRef.current?.hide();
    setSelectCountInput('');
  };

  const allOnPageSelected =
    artworks.length > 0 && artworks.every(a => selectedIds.has(a.id));

  const someOnPageSelected =
    artworks.some(a => selectedIds.has(a.id)) && !allOnPageSelected;

  const handleSelectAllPage = () => {
    if (allOnPageSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        artworks.forEach(a => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        artworks.forEach(a => next.add(a.id));
        return next;
      });
    }
  };

  const totalSelected = selectedIds.size;

  const headerTemplate = (
    <div className="table-header">
      <div className="left-section">
        <h2>The Collection</h2>
        <span className="results-count">
          Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–
          {Math.min(currentPage * ROWS_PER_PAGE, totalRecords)} of {totalRecords} results
        </span>
      </div>

      <div className="right-section">
        {totalSelected > 0 && (
          <span className="selected-count">
            {totalSelected} selected
          </span>
        )}

        <Button
          label="Select Rows"
          icon="pi pi-list-check"
          className="p-button-outlined"
          onClick={(e) => overlayRef.current?.toggle(e)}
        />
      </div>
    </div>
  );

  const selectionHeaderTemplate = () => (
    <div
      className={`custom-header-checkbox ${
        allOnPageSelected
          ? 'checked'
          : someOnPageSelected
          ? 'indeterminate'
          : ''
      }`}
      onClick={handleSelectAllPage}
    >
      {allOnPageSelected && <i className="pi pi-check" />}
      {someOnPageSelected && <span className="indeterminate-mark">–</span>}
    </div>
  );

  return (
    <div className="app-container">
      <DataTable
        value={artworks}
        lazy
        paginator
        rows={ROWS_PER_PAGE}
        totalRecords={totalRecords}
        first={(currentPage - 1) * ROWS_PER_PAGE}
        onPage={handlePageChange}
        loading={loading}
        selection={selectedRowsOnPage}
        onSelectionChange={handleSelectionChange}
        selectionMode="multiple"
        dataKey="id"
        header={headerTemplate}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first}–{last} of {totalRecords} results"
        className="art-table"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: '3rem' }}
          header={selectionHeaderTemplate}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <OverlayPanel ref={overlayRef}>
        <div style={{ padding: '1rem', width: '250px' }}>
          <h4>Custom Row Selection</h4>
          <p>Select N rows progressively as you navigate pages.</p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <InputText
              value={selectCountInput}
              onChange={e => setSelectCountInput(e.target.value)}
              type="number"
              min="1"
              placeholder="e.g. 25"
            />
            <Button label="Select" onClick={handleCustomSelect} />
          </div>

          {pendingSelectCount > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Selecting… {pendingSelectedSoFar}/{pendingSelectCount}
            </div>
          )}

          {totalSelected > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <span>{totalSelected} selected</span>
              <Button
                label="Clear"
                className="p-button-text"
                onClick={() => {
                  setSelectedIds(new Set());
                  setPendingSelectCount(0);
                  setPendingSelectedSoFar(0);
                }}
              />
            </div>
          )}
        </div>
      </OverlayPanel>
    </div>
  );
}