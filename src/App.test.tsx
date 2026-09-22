import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}))
vi.mock('./supabase', () => ({ supabase: { auth } }))
vi.mock('./config', () => ({
  publicConfig: {
    appUrl: 'http://localhost:5173/',
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'sb_publishable_test',
  },
}))

describe('App', () => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.clearAllMocks()
    auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    window.history.replaceState({}, '', '/InovaPro.app/')
  })
  it('encerra o boot sem sessão', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    render(<App />)
    expect(screen.getByText('Carregando InovaPro...')).toBeInTheDocument()
    expect(await screen.findByText(/Seu negócio conectado/)).toBeInTheDocument()
  })
  it('abre a área autenticada com sessão válida', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { user: { id: '1', email: 'pessoa@example.com' } } },
      error: null,
    })
    render(<App />)
    expect(await screen.findByText('pessoa@example.com')).toBeInTheDocument()
  })
  it('exibe erro e permite tentar a sessão novamente', async () => {
    auth.getSession
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: { session: null }, error: null })
    render(<App />)
    expect(await screen.findByText('Não foi possível verificar sua sessão.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText(/Seu negócio conectado/)).toBeInTheDocument()
    expect(auth.getSession).toHaveBeenCalledTimes(2)
  })
  it('faz login e fecha o modal', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    auth.signInWithPassword.mockResolvedValue({ error: null })
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar sessão' }))
    await userEvent.type(screen.getByLabelText('E-mail'), 'pessoa@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(auth.signInWithPassword).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('mostra erro de login', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    auth.signInWithPassword.mockResolvedValue({ error: new Error('Credenciais inválidas') })
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar sessão' }))
    await userEvent.type(screen.getByLabelText('E-mail'), 'pessoa@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas')
  })
  it('envia cadastro com metadados e redirect configurado', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null })
    render(<App />)
    await userEvent.click((await screen.findAllByRole('button', { name: 'Criar conta' }))[0])
    await userEvent.type(screen.getByLabelText('Nome'), 'Pessoa Teste')
    await userEvent.type(screen.getByLabelText('E-mail'), 'pessoa@example.com')
    await userEvent.type(screen.getByLabelText('Celular ou WhatsApp'), '11999999999')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Criar conta' }),
    )
    await waitFor(() => expect(auth.signUp).toHaveBeenCalled())
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'http://localhost:5173/',
          data: { full_name: 'Pessoa Teste', phone: '11999999999' },
        }),
      }),
    )
  })
  it('fecha o modal com Escape', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar sessão' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('expõe estados acessíveis de menu e FAQ', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    render(<App />)
    const menu = await screen.findByRole('button', { name: 'Abrir menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(menu)
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await userEvent.click(screen.getAllByRole('button', { name: 'FAQ' })[0])
    const faq = screen.getByRole('button', { name: /A InovaPro atende/ })
    expect(faq).toHaveAttribute('aria-expanded', 'true')
  })
})
